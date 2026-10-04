import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View, Text, Pressable, TextInput, ScrollView, Image, LayoutAnimation, Platform, UIManager, Animated, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';

import { ScannerService } from '../../services/cv/ScannerService';
import { FrontendResultModel } from '../../services/cv/models';
import { Database } from '../../supabase';
import { InventoryItem } from '../../supabase/database';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  // Safe-call because it warns in the New Architecture
  const _ = UIManager.setLayoutAnimationEnabledExperimental;
}

type ScanState = 'mode_selection' | 'camera' | 'preview' | 'processing' | 'ocr_review' | 'batch_selection' | 'quantity_input' | 'final_review' | 'payment_selection' | 'payment_processing' | 'saving' | 'success';
type ScanMode = 'stock_in' | 'stock_out';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanStateRaw, _setScanState] = useState<ScanState>('mode_selection');
  
  const setScanState = (newState: ScanState) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    _setScanState(newState);
  };
  const scanState = scanStateRaw;
  const [scanMode, setScanMode] = useState<ScanMode>('stock_in');
  const [result, setResult] = useState<FrontendResultModel | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  type PaymentMethod = 'gpay' | 'phonepe' | 'paytm' | 'card' | 'cash' | 'demo';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const cameraRef = useRef<CameraView>(null);

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const beamAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanState === 'camera') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(beamAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(beamAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
        ])
      ).start();
    } else {
      beamAnim.setValue(0);
    }
  }, [scanState]);

  // Editable fields - Medicine
  const [medicineName, setMedicineName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [composition, setComposition] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState('');
  
  // Editable fields - Batch
  const [batchNumber, setBatchNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  
  // Editable fields - Pricing
  const [mrp, setMrp] = useState('');
  const [currency, setCurrency] = useState('');

  // Editable fields - Manufacturer
  const [manufacturer, setManufacturer] = useState('');
  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [manufacturingLicenseNumber, setManufacturingLicenseNumber] = useState('');

  // Editable fields - Pack
  const [packSize, setPackSize] = useState('');
  const [packUnit, setPackUnit] = useState('');

  // Editable fields - Identification
  const [barcode, setBarcode] = useState('');
  const [gtin, setGtin] = useState('');
  const [qrCode, setQrCode] = useState('');

  // Editable fields - Storage & Safety
  const [storageInstructions, setStorageInstructions] = useState('');
  const [prescriptionInfo, setPrescriptionInfo] = useState('');
  const [warnings, setWarnings] = useState('');

  // Editable fields - Contact
  const [customerCare, setCustomerCare] = useState('');
  const [website, setWebsite] = useState('');

  // Stock Out State
  const [availableBatches, setAvailableBatches] = useState<InventoryItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<InventoryItem | null>(null);

  // Auto-requesting permissions in useEffect can sometimes cause React state update warnings
  // during Expo Router's initial mount/linking phase. We rely on the button instead.

  const handleBack = () => {
    switch (scanState) {
      case 'camera':
        setScanState('mode_selection');
        break;
      case 'preview':
        setScanState('camera');
        break;
      case 'processing':
        setScanState('camera');
        setIsAnalyzing(false);
        break;
      case 'ocr_review':
        Alert.alert('Discard Scanned Data?', 'Are you sure you want to go back? Extracted details will be lost.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => {
            setScanState('camera');
            setCapturedUri(null);
            setResult(null);
          }}
        ]);
        break;
      case 'batch_selection':
        setScanState('ocr_review');
        break;
      case 'quantity_input':
        setScanState(scanMode === 'stock_out' ? 'batch_selection' : 'ocr_review');
        break;
      case 'final_review':
        setScanState('quantity_input');
        break;
      case 'success':
        router.push('/');
        break;
      default:
        break;
    }
  };

  // Handle Android system back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (scanStateRaw !== 'mode_selection' && scanStateRaw !== 'success' && scanStateRaw !== 'saving') {
          handleBack();
          return true; // Prevent default
        }
        if (scanStateRaw === 'success') {
          setScanState('mode_selection');
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [scanStateRaw, scanMode, result]) // Ensure the closure has the latest state
  );

  const renderHeader = (title: string, subtitle: string, subtitleStyle: any = styles.headerSubtitle, showBack = true) => (
    <View style={styles.header}>
      {showBack && (
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color={COLORS.text.primary} />
        </Pressable>
      )}
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={subtitleStyle}>{subtitle}</Text> : null}
      </View>
      {showBack && (
        <Pressable style={styles.cancelButton} onPress={() => {
           Alert.alert('Cancel Transaction?', 'Are you sure you want to cancel and return to the start?', [
             { text: 'No', style: 'cancel' },
             { text: 'Yes', style: 'destructive', onPress: () => {
               setScanState('mode_selection');
               setCapturedUri(null);
               setResult(null);
             }}
           ]);
        }}>
          <Ionicons name="close" size={28} color={COLORS.text.secondary} />
        </Pressable>
      )}
    </View>
  );

  const handleTakePhoto = async () => {
    if (!cameraReady) return;
    try {
      const picture = await cameraRef.current?.takePictureAsync();
      if (picture?.uri) {
        setCapturedUri(picture.uri);
        setScanState('preview');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Camera Error', 'Could not take photo.');
    }
  };

  const processImage = async () => {
    if (isAnalyzing || !capturedUri) return;
    setIsAnalyzing(true);
    setScanState('processing');
    setScanError(null);
    try {
      // Resize image down to 1000px width before uploading to drastically reduce payload size over WiFi
      const manipResult = await manipulateAsync(
        capturedUri,
        [{ resize: { width: 1000 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      const res = await ScannerService.processFrame({
        imageUri: manipResult.uri,
      });

      setResult(res);
      
      // Populate edit fields
      setMedicineName(res.medicine.name || '');
      setGenericName(res.medicine.genericName || '');
      setActiveIngredient(res.medicine.activeIngredient || '');
      setComposition(res.medicine.composition || '');
      setStrength(res.medicine.strength || '');
      setForm(res.medicine.form || '');
      
      setBatchNumber(res.batch.batchNumber || '');
      setLotNumber(res.batch.lotNumber || '');
      setMfgDate(res.batch.manufacturingDate || '');
      setExpDate(res.batch.expiryDate || '');
      
      setMrp(res.batch.mrp ? res.batch.mrp.toString() : '');
      setCurrency(res.batch.currency || '');

      setManufacturer(res.medicine.manufacturer || '');
      setManufacturerAddress(res.medicine.manufacturerAddress || '');
      setManufacturingLicenseNumber(res.medicine.manufacturingLicenseNumber || '');

      setPackSize(res.pack.packSize ? res.pack.packSize.toString() : '');
      setPackUnit(res.pack.packUnit || '');

      setBarcode(res.identification.barcode || '');
      setGtin(res.identification.gtin || '');
      setQrCode(res.identification.qrCode || '');

      setStorageInstructions(res.safety.storageInstructions || '');
      setPrescriptionInfo(res.safety.prescriptionInfo || '');
      setWarnings(res.safety.warnings || '');

      setCustomerCare(res.contact.customerCare || '');
      setWebsite(res.contact.website || '');

      console.log("========== MEDTRIX OCR RESPONSE ==========");
      console.log(JSON.stringify(res, null, 2));
      console.log("medicine_name:", res.medicine.name);
      console.log("batch_number:", res.batch.batchNumber);
      console.log("expiry_date:", res.batch.expiryDate);

      setScanState('ocr_review');
    } catch (error) {
      console.error(error);
      setScanError('Could not process this medicine cover.');
      setScanState('preview');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmOcr = async () => {
    if (!medicineName.trim()) {
      Alert.alert('Validation Error', 'Medicine Name is required.');
      return;
    }
    if (scanMode === 'stock_in') {
      if (!batchNumber.trim() || !expDate.trim()) {
        Alert.alert('Validation Error', 'Batch Number and Expiry Date are required for Stock In.');
        return;
      }
      setScanState('quantity_input');
    } else {
      // For Stock Out, we need to fetch available batches for this medicine
      setScanState('processing');
      const { data, error } = await Database.findBatchesByMedicineName(medicineName);
      if (error || !data || data.length === 0) {
        Alert.alert('No Stock Found', 'No available stock was found for this medicine.');
        setScanState('ocr_review');
        return;
      }
      setAvailableBatches(data);
      setSelectedBatch(data[0]); // Default to first (FEFO)
      setScanState('batch_selection');
    }
  };

  const handleConfirmQuantity = () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Validation Error', 'Enter a valid quantity greater than zero.');
      return;
    }

    if (scanMode === 'stock_out' && selectedBatch) {
      if (qty > selectedBatch.quantity) {
        Alert.alert('Insufficient Stock', `Only ${selectedBatch.quantity} units are available.`);
        return;
      }
      if (selectedBatch.status === 'critical' && selectedBatch.quantity === 0) {
        Alert.alert('No Stock', 'Selected batch is out of stock.');
        return;
      }
      if (selectedBatch.expiryDate && new Date(selectedBatch.expiryDate) < new Date()) {
        Alert.alert('Expired', 'Cannot issue expired medicine.');
        return;
      }
    }
    
    // Update result with edited values
    if (result) {
      setResult({
        ...result,
        medicine: {
          ...result.medicine,
          name: medicineName,
          genericName,
          activeIngredient,
          composition,
          strength,
          form,
          manufacturer,
          manufacturerAddress,
          manufacturingLicenseNumber,
        },
        batch: {
          ...result.batch,
          batchNumber,
          lotNumber,
          manufacturingDate: mfgDate,
          expiryDate: expDate,
          mrp: mrp ? parseFloat(mrp) : undefined,
          currency,
        },
        pack: {
          ...result.pack,
          packSize: packSize ? parseInt(packSize, 10) : undefined,
          packUnit,
        },
        identification: {
          ...result.identification,
          barcode,
          gtin,
          qrCode,
        },
        safety: {
          ...result.safety,
          storageInstructions,
          prescriptionInfo,
          warnings,
        },
        contact: {
          ...result.contact,
          customerCare,
          website,
        },
        quantity: {
          ...result.quantity,
          totalCalculated: qty,
        },
      });
    }
    setScanState('final_review');
  };

  const handleSaveToInventory = async () => {
    setScanState('saving');
    
    if (scanMode === 'stock_in') {
      if (!result) return;
      const { error } = await Database.saveScannedMedicine(result);
      if (error) {
        console.warn('Stock In warning:', error);
      }
    } else {
      if (!selectedBatch) return;
      const { error } = await Database.processStockOut(selectedBatch.id, parseInt(quantity, 10));
      if (error) {
        console.warn('Stock Out warning:', error);
      }
    }

    setScanState('success');
  };

  const renderInput = (label: string, value: string, setter: (val: string) => void, keyboardType: any = 'default', required = false) => (
    <View style={styles.inputGroup} key={label}>
      <Text style={styles.label}>{label} {required && '*'}</Text>
      <TextInput 
        style={styles.input} 
        value={value} 
        onChangeText={setter} 
        keyboardType={keyboardType} 
        placeholder={value ? '' : 'Not detected'} 
        placeholderTextColor={COLORS.text.disabled}
      />
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera Access Required</Text>
        <Text style={styles.permissionSub}>Medtrix needs camera access to scan medicine packages.</Text>
        <Pressable onPress={requestPermission} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Allow Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {scanState === 'mode_selection' && (
        <View style={styles.centerContainer}>
          <Text style={styles.headerTitle}>Select Action</Text>
          <Text style={styles.headerSubtitle}>What would you like to do with the scanner?</Text>
          
          <View style={{ marginTop: 40, width: '100%', paddingHorizontal: 20, gap: 16 }}>
            <Pressable style={[styles.modeCard, GLASS.standard]} onPress={() => { setScanMode('stock_in'); setScanState('camera'); }}>
              <Ionicons name="arrow-down-circle-outline" size={40} color={COLORS.status.healthy} />
              <View style={styles.modeCardContent}>
                <Text style={styles.modeCardTitle}>Stock In</Text>
                <Text style={styles.modeCardSub}>Add or increase medicine inventory</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.modeCard, GLASS.standard]} onPress={() => { setScanMode('stock_out'); setScanState('camera'); }}>
              <Ionicons name="arrow-up-circle-outline" size={40} color={COLORS.status.info} />
              <View style={styles.modeCardContent}>
                <Text style={styles.modeCardTitle}>Stock Out</Text>
                <Text style={styles.modeCardSub}>Issue medicine and reduce inventory</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.modeCard, GLASS.standard, { marginTop: 16 }]} onPress={() => router.push('/checkout')}>
              <Ionicons name="cart-outline" size={40} color={COLORS.brand.primary} />
              <View style={styles.modeCardContent}>
                <Text style={styles.modeCardTitle}>Sales & Checkout</Text>
                <Text style={styles.modeCardSub}>Add medicines to cart, confirm demo payment, and automatically update stock.</Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}

      {scanState === 'camera' && (
        <View style={styles.fullFlex}>
          {renderHeader(
            scanMode === 'stock_in' ? 'Stock In Scan' : 'Stock Out Scan',
            'Scan a medicine package to extract its details'
          )}
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              onCameraReady={() => setCameraReady(true)}
            />
            <View style={styles.scanFrameOverlay}>
               <View style={[
                 styles.scanFrame, 
                 { 
                   borderColor: scanMode === 'stock_in' ? COLORS.status.healthy : COLORS.status.info,
                   shadowColor: scanMode === 'stock_in' ? COLORS.status.healthy : COLORS.status.info,
                   shadowOpacity: 0.8,
                   shadowRadius: 15,
                   elevation: 10
                 }
               ]}>
                 <Animated.View style={[styles.scanBeam, {
                    transform: [{
                      translateY: beamAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-90, 90]
                      })
                    }],
                    backgroundColor: scanMode === 'stock_in' ? COLORS.status.healthy : COLORS.status.info
                 }]} />
                 <Text style={styles.scanFrameText}>Align medicine label inside frame</Text>
               </View>
            </View>
          </View>
          <View style={styles.bottomActions}>
            <Pressable style={styles.primaryButton} onPress={handleTakePhoto}>
              <Text style={styles.primaryButtonText}>Capture</Text>
            </Pressable>
            <Pressable style={[styles.secondaryButton, {marginTop: 12}]} onPress={() => {}}>
              <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            </Pressable>
            <Pressable 
              style={[styles.secondaryButton, styles.backSelectionButton, GLASS.standard]} 
              onPress={() => setScanState('mode_selection')}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.brand.primary} style={{ marginRight: 8 }} />
              <Text style={styles.backSelectionButtonText}>Back to Stock Selection</Text>
            </Pressable>
          </View>
        </View>
      )}

      {scanState === 'preview' && (
        <View style={styles.fullFlex}>
          {renderHeader('Review Photo', '')}
          <View style={styles.imagePreviewContainer}>
            {capturedUri && <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} />}
          </View>
          {scanError && <Text style={styles.errorText}>{scanError}</Text>}
          <View style={styles.bottomActionsRow}>
            <Pressable style={styles.secondaryButtonFlex} onPress={() => setScanState('camera')}>
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </Pressable>
            <Pressable 
              style={[styles.primaryButtonFlex, isAnalyzing && { opacity: 0.7 }]} 
              onPress={processImage}
              disabled={isAnalyzing}
            >
              <Text style={styles.primaryButtonText}>{isAnalyzing ? 'Analyzing...' : 'Use This Photo'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {scanState === 'processing' && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.titleText}>Analyzing Medicine</Text>
          <Text style={styles.subText}>Extracting medicine information...</Text>
        </View>
      )}

      {scanState === 'ocr_review' && (
        <View style={styles.fullFlex}>
          {renderHeader('Review Medicine Details', 'Verify the detected information before continuing.')}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderSectionHeader('MEDICINE')}
            {renderInput('Medicine Name', medicineName, setMedicineName, 'default', true)}
            {renderInput('Generic Name', genericName, setGenericName)}
            {renderInput('Active Ingredient', activeIngredient, setActiveIngredient)}
            {renderInput('Composition', composition, setComposition)}
            {renderInput('Strength', strength, setStrength)}
            {renderInput('Dosage Form', form, setForm)}

            {renderSectionHeader('BATCH')}
            {renderInput('Batch Number', batchNumber, setBatchNumber, 'default', true)}
            {renderInput('Lot Number', lotNumber, setLotNumber)}
            {renderInput('Manufacturing Date', mfgDate, setMfgDate)}
            {renderInput('Expiry Date', expDate, setExpDate, 'default', true)}

            {renderSectionHeader('PRICING')}
            {renderInput('MRP', mrp, setMrp, 'numeric')}
            {renderInput('Currency', currency, setCurrency)}

            {renderSectionHeader('MANUFACTURER')}
            {renderInput('Manufacturer', manufacturer, setManufacturer)}
            {renderInput('Manufacturer Address', manufacturerAddress, setManufacturerAddress)}
            {renderInput('Manufacturing Licence', manufacturingLicenseNumber, setManufacturingLicenseNumber)}

            {renderSectionHeader('PACK')}
            {renderInput('Pack Size', packSize, setPackSize, 'numeric')}
            {renderInput('Pack Unit', packUnit, setPackUnit)}

            {renderSectionHeader('IDENTIFICATION')}
            {renderInput('Barcode', barcode, setBarcode)}
            {renderInput('GTIN', gtin, setGtin)}
            {renderInput('QR Code', qrCode, setQrCode)}

            {renderSectionHeader('STORAGE & SAFETY')}
            {renderInput('Storage Instructions', storageInstructions, setStorageInstructions)}
            {renderInput('Prescription Information', prescriptionInfo, setPrescriptionInfo)}
            {renderInput('Warnings', warnings, setWarnings)}

            {renderSectionHeader('CONTACT')}
            {renderInput('Customer Care', customerCare, setCustomerCare)}
            {renderInput('Website', website, setWebsite)}
            <View style={{height: 100}} />
          </ScrollView>
          <View style={styles.bottomActionsAbsolute}>
            <Pressable style={styles.primaryButton} onPress={handleConfirmOcr}>
              <Text style={styles.primaryButtonText}>Confirm Medicine Details</Text>
            </Pressable>
          </View>
        </View>
      )}

      {scanState === 'batch_selection' && (
        <View style={styles.fullFlex}>
          {renderHeader('Select Batch', 'Choose which batch to issue from. Earliest expiry is selected by default.')}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {availableBatches.map(batch => (
               <Pressable 
                 key={batch.id} 
                 style={[styles.batchCard, selectedBatch?.id === batch.id && styles.batchCardSelected, GLASS.standard]}
                 onPress={() => setSelectedBatch(batch)}
               >
                 <View style={styles.batchCardRow}>
                   <Text style={styles.batchCardTitle}>Batch: {batch.batchNumber}</Text>
                   {selectedBatch?.id === batch.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.brand.primary} />}
                 </View>
                 <Text style={styles.batchCardSub}>Expiry: {batch.expiryDate}</Text>
                 <Text style={[styles.batchCardSub, { color: COLORS.brand.primary, ...TYPOGRAPHY.bodyBold }]}>Available Stock: {batch.quantity}</Text>
               </Pressable>
            ))}
          </ScrollView>
          <View style={styles.bottomActionsAbsoluteRow}>
            <Pressable style={styles.secondaryButtonFlex} onPress={() => setScanState('ocr_review')}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
            <Pressable style={styles.primaryButtonFlex} onPress={() => setScanState('quantity_input')}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      )}

      {scanState === 'quantity_input' && (
        <View style={styles.fullFlex}>
          {renderHeader(
            scanMode === 'stock_in' ? 'Add Stock' : 'Issue Stock',
            scanMode === 'stock_in' ? 'How many units are being added to inventory?' : 'How many units are being issued?'
          )}
          <View style={styles.centerContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{medicineName}</Text>
              {scanMode === 'stock_in' ? (
                <>
                  <Text style={styles.summarySub}>{strength} {form}</Text>
                  <Text style={styles.summarySub}>Batch {batchNumber}</Text>
                  {packSize ? <Text style={styles.summarySub}>Pack Size: {packSize} {packUnit}</Text> : null}
                </>
              ) : (
                <>
                  <Text style={styles.summarySub}>Batch: {selectedBatch?.batchNumber}</Text>
                  <Text style={[styles.summarySub, { color: COLORS.brand.primary, marginTop: 8, ...TYPOGRAPHY.bodyBold }]}>Available Stock: {selectedBatch?.quantity} units</Text>
                </>
              )}
            </View>
            <Text style={styles.quantityLabel}>{scanMode === 'stock_in' ? 'Quantity Received' : 'Quantity Issued'}</Text>
            <TextInput 
              style={styles.quantityInput} 
              value={quantity} 
              onChangeText={setQuantity} 
              keyboardType="number-pad" 
              autoFocus 
              textAlign="center"
              placeholder="0"
            />
            <Text style={styles.quantityUnit}>units</Text>
          </View>
          <View style={styles.bottomActionsRow}>
            <Pressable style={styles.secondaryButtonFlex} onPress={() => setScanState(scanMode === 'stock_out' ? 'batch_selection' : 'ocr_review')}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
            <Pressable style={styles.primaryButtonFlex} onPress={handleConfirmQuantity}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      )}

      {scanState === 'final_review' && (
        <View style={styles.fullFlex}>
          {renderHeader(
            'Confirm Transaction',
            `Please verify the information before ${scanMode === 'stock_in' ? 'adding' : 'issuing'} this stock.`,
            styles.headerSubtitleWarning
          )}
          <ScrollView contentContainerStyle={[styles.scrollContent, {paddingBottom: 150}]}>
            <View style={styles.finalCard}>
              <View style={styles.finalRow}>
                <Text style={styles.finalLabel}>Action</Text>
                <Text style={[styles.finalValueBold, { color: scanMode === 'stock_in' ? COLORS.status.healthy : COLORS.status.info }]}>
                  {scanMode === 'stock_in' ? 'Stock In' : 'Stock Out'}
                </Text>
              </View>
              <View style={styles.finalRow}><Text style={styles.finalLabel}>Medicine</Text><Text style={styles.finalValue}>{medicineName}</Text></View>
              {scanMode === 'stock_in' && genericName ? <View style={styles.finalRow}><Text style={styles.finalLabel}>Generic</Text><Text style={styles.finalValue}>{genericName}</Text></View> : null}
              {scanMode === 'stock_in' && form ? <View style={styles.finalRow}><Text style={styles.finalLabel}>Form</Text><Text style={styles.finalValue}>{form}</Text></View> : null}
              <View style={styles.finalRow}><Text style={styles.finalLabel}>Batch</Text><Text style={styles.finalValueMono}>{scanMode === 'stock_in' ? batchNumber : selectedBatch?.batchNumber}</Text></View>
              {scanMode === 'stock_in' && mfgDate ? <View style={styles.finalRow}><Text style={styles.finalLabel}>MFG</Text><Text style={styles.finalValue}>{mfgDate}</Text></View> : null}
              <View style={styles.finalRow}><Text style={styles.finalLabel}>EXP</Text><Text style={styles.finalValue}>{scanMode === 'stock_in' ? expDate : selectedBatch?.expiryDate}</Text></View>
              {scanMode === 'stock_out' && <View style={styles.finalRow}><Text style={styles.finalLabel}>Remaining</Text><Text style={styles.finalValueBold}>{((selectedBatch?.quantity || 0) - parseInt(quantity, 10))} units</Text></View>}
              <View style={[styles.finalRow, {borderBottomWidth: 0}]}><Text style={styles.finalLabel}>{scanMode === 'stock_in' ? 'Added' : 'Issued'} Qty</Text><Text style={styles.finalValueBold}>{quantity} units</Text></View>
            </View>
          </ScrollView>
          <View style={styles.bottomActionsAbsoluteRow}>
            <Pressable style={styles.secondaryButtonFlex} onPress={() => setScanState('quantity_input')}>
              <Text style={styles.secondaryButtonText}>Back & Edit</Text>
            </Pressable>
            <Pressable style={styles.primaryButtonFlex} onPress={() => {
              if (scanMode === 'stock_in') {
                handleSaveToInventory();
              } else {
                setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
                setScanState('payment_selection');
              }
            }}>
              <Text style={styles.primaryButtonText}>{scanMode === 'stock_in' ? 'Confirm & Add' : 'Proceed to Payment'}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {scanState === 'payment_selection' && (() => {
        const totalAmount = parseInt(quantity || '0', 10) * 150; // Mock unit price ₹150 for prototype
        
        const qrPayload = `upi://pay?pa=demo@medtrix&pn=MedtrixStore&tr=${orderId}&am=${totalAmount}&cu=INR`;

        return (
          <View style={styles.fullFlex}>
            <View style={styles.header}>
              <Pressable onPress={() => setScanState('final_review')} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
              </Pressable>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Make Payment</Text>
                <Text style={styles.headerSubtitle}>Scan the QR to complete order {orderId}</Text>
              </View>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={[styles.cartContainer, {alignItems: 'center', marginTop: 24, paddingVertical: 40}]}>
                <Text style={[styles.sectionTitle, {marginBottom: 32}]}>Total: ₹{totalAmount}</Text>
                
                <View style={{padding: 16, backgroundColor: '#fff', borderRadius: 16, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10}}>
                  <QRCode
                    value={qrPayload}
                    size={200}
                    color="black"
                    backgroundColor="white"
                  />
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 32, gap: 8}}>
                  <Ionicons name="scan-outline" size={24} color={COLORS.text.secondary} />
                  <Text style={styles.subText}>Scan with GPay or another UPI App</Text>
                </View>
                
                <View style={{backgroundColor: COLORS.status.warning + '20', padding: 12, borderRadius: 8, marginTop: 24, width: '100%'}}>
                  <Text style={[styles.subText, {color: COLORS.status.warning, textAlign: 'center'}]}>DEMO PAYMENT — No real money transferred.</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomActionsAbsolute}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable 
                  style={styles.primaryButtonFlex} 
                  onPress={() => {
                    setScanState('payment_processing');
                    setTimeout(() => {
                      handleSaveToInventory();
                    }, 1500);
                  }}
                >
                  <Text style={styles.primaryButtonText}>Confirm Demo Payment</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })()}

      {scanState === 'payment_processing' && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.titleText}>Processing Demo Payment</Text>
          <Text style={styles.subText}>This is a simulated transaction. Please wait.</Text>
        </View>
      )}

      {scanState === 'saving' && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.titleText}>{scanMode === 'stock_in' ? 'Saving Inventory' : 'Issuing Inventory'}</Text>
          <Text style={styles.subText}>Updating stock...</Text>
        </View>
      )}

      {scanState === 'success' && (
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.status.healthy} />
          <Text style={styles.titleText}>{scanMode === 'stock_in' ? 'Stock Added Successfully' : 'Payment Confirmed — Stock Updated Successfully'}</Text>
          
          <View style={styles.successCard}>
            {scanMode === 'stock_out' && (
              <>
                <Text style={styles.summaryTitle}>Demo Payment</Text>
                <Text style={styles.summarySub}>This is a simulated payment for demonstration purposes. No real money has been charged.</Text>
                <View style={styles.divider} />
              </>
            )}
            <Text style={styles.summaryTitle}>{medicineName} {strength}</Text>
            <Text style={styles.summarySub}>Batch: <Text style={TYPOGRAPHY.monoBold}>{scanMode === 'stock_in' ? batchNumber : selectedBatch?.batchNumber}</Text></Text>
            <View style={styles.divider} />
            <Text style={styles.summarySub}>Quantity {scanMode === 'stock_in' ? 'Added' : 'Issued'}: <Text style={{color: scanMode === 'stock_in' ? COLORS.status.healthy : COLORS.status.info, ...TYPOGRAPHY.bodyBold}}>{scanMode === 'stock_in' ? '+' : '-'}{quantity}</Text></Text>
          </View>

          <View style={styles.bottomActionsSuccess}>
            <Pressable style={styles.primaryButton} onPress={() => router.navigate('/inventory')}>
              <Text style={styles.primaryButtonText}>View Inventory</Text>
            </Pressable>
            <Pressable style={[styles.secondaryButton, {marginTop: 16}]} onPress={() => {
              setScanState('camera');
              setCapturedUri(null);
              setResult(null);
              setQuantity('');
            }}>
              <Text style={styles.secondaryButtonText}>Scan Another Medicine</Text>
            </Pressable>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background.canvas },
  fullFlex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  backButton: { marginRight: 12, padding: 4, borderRadius: 20 },
  cancelButton: { marginLeft: 12, padding: 4, borderRadius: 20 },
  headerTextContainer: { flex: 1 },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 24, color: COLORS.text.primary, marginBottom: 4 },
  headerSubtitle: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.secondary },
  headerSubtitleWarning: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.status.warning },
  
  cameraContainer: { flex: 1, margin: 16, borderRadius: 24, overflow: 'hidden' },
  scanFrameOverlay: { ...StyleSheet.absoluteFill as object, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 280, height: 180, borderWidth: 2, borderColor: COLORS.brand.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(37, 99, 235, 0.1)', overflow: 'hidden' },
  scanBeam: { position: 'absolute', width: '100%', height: 2, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 5 },
  scanFrameText: { ...TYPOGRAPHY.bodyMedium, color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, overflow: 'hidden' },
  
  imagePreviewContainer: { flex: 1, margin: 16, borderRadius: 24, overflow: 'hidden' },
  
  bottomActions: { padding: 20, paddingBottom: 100 },
  bottomActionsRow: { flexDirection: 'row', padding: 20, paddingBottom: 100, gap: 12 },
  bottomActionsAbsolute: { position: 'absolute', bottom: 100, left: 20, right: 20, backgroundColor: COLORS.background.canvas, paddingTop: 10 },
  bottomActionsAbsoluteRow: { position: 'absolute', bottom: 100, left: 20, right: 20, flexDirection: 'row', gap: 12, backgroundColor: COLORS.background.canvas, paddingTop: 10 },
  bottomActionsSuccess: { position: 'absolute', bottom: 100, left: 20, right: 20 },
  
  primaryButton: { backgroundColor: COLORS.brand.primary, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.brand.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonFlex: { flex: 1, backgroundColor: COLORS.brand.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.brand.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { ...TYPOGRAPHY.bodyBold, color: '#fff', fontSize: 16, textAlign: 'center' },
  
  secondaryButton: { backgroundColor: COLORS.background.secondary, paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border.subtle },
  secondaryButtonFlex: { flex: 1, backgroundColor: COLORS.background.secondary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border.subtle },
  secondaryButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.text.primary, fontSize: 16, textAlign: 'center' },
  
  backSelectionButton: { marginTop: 12, flexDirection: 'row', backgroundColor: 'rgba(37, 99, 235, 0.08)', borderColor: 'rgba(37, 99, 235, 0.5)' },
  backSelectionButtonText: { ...TYPOGRAPHY.bodyBold, color: COLORS.brand.primary, fontSize: 16, textAlign: 'center' },

  permissionText: { ...TYPOGRAPHY.heading, fontSize: 20, marginBottom: 10 },
  permissionSub: { ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: 24, color: COLORS.text.secondary },

  titleText: { ...TYPOGRAPHY.heading, fontSize: 22, color: COLORS.text.primary, marginTop: 24, marginBottom: 8 },
  subText: { ...TYPOGRAPHY.body, color: COLORS.text.secondary, textAlign: 'center' },
  errorText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.status.critical, textAlign: 'center', marginTop: 10 },

  scrollContent: { padding: 20, paddingBottom: 150 },
  sectionHeader: { ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.brand.deep, marginTop: 16, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border.subtle, paddingBottom: 4 },
  inputGroup: { marginBottom: 16 },
  inlineInput: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, ...TYPOGRAPHY.bodyBold, fontSize: 16, color: COLORS.text.primary, minWidth: 100, textAlign: 'right' },
  label: { ...TYPOGRAPHY.bodyMedium, color: COLORS.text.secondary, marginBottom: 6, fontSize: 14 },
  input: { ...GLASS.hero, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, ...TYPOGRAPHY.body, fontSize: 16, color: COLORS.text.primary, borderWidth: 1, borderColor: COLORS.border.subtle },

  summaryCard: { ...GLASS.hero, backgroundColor: '#fff', padding: 24, width: '100%', alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: COLORS.border.subtle },
  summaryTitle: { ...TYPOGRAPHY.heading, fontSize: 22, color: COLORS.text.primary, marginBottom: 4 },
  summarySub: { ...TYPOGRAPHY.body, fontSize: 16, color: COLORS.text.secondary, marginBottom: 2 },
  
  quantityLabel: { ...TYPOGRAPHY.heading, fontSize: 20, color: COLORS.text.primary, marginBottom: 16 },
  quantityInput: { ...TYPOGRAPHY.heading, fontSize: 64, color: COLORS.brand.primary, minWidth: 150, borderBottomWidth: 2, borderBottomColor: COLORS.border.subtle, paddingVertical: 8 },
  quantityUnit: { ...TYPOGRAPHY.body, fontSize: 18, color: COLORS.text.secondary, marginTop: 12 },

  finalCard: { ...GLASS.hero, backgroundColor: '#fff', padding: 24, borderWidth: 1, borderColor: COLORS.border.subtle },
  finalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border.subtle },
  finalLabel: { ...TYPOGRAPHY.body, color: COLORS.text.secondary, fontSize: 15 },
  finalValue: { ...TYPOGRAPHY.bodyMedium, color: COLORS.text.primary, fontSize: 15, flex: 1, textAlign: 'right', paddingLeft: 16 },
  finalValueMono: { ...TYPOGRAPHY.mono, color: COLORS.text.primary, fontSize: 15, flex: 1, textAlign: 'right', paddingLeft: 16 },
  finalValueBold: { ...TYPOGRAPHY.bodyBold, color: COLORS.text.primary, fontSize: 16, flex: 1, textAlign: 'right' },

  successCard: { ...GLASS.hero, backgroundColor: '#fff', padding: 24, width: '100%', marginTop: 24, borderWidth: 1, borderColor: COLORS.border.subtle },
  divider: { height: 1, backgroundColor: COLORS.border.subtle, marginVertical: 12 },
  
  modeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border.subtle },
  modeCardContent: { marginLeft: 16, flex: 1 },
  modeCardTitle: { ...TYPOGRAPHY.heading, fontSize: 18, color: COLORS.text.primary, marginBottom: 4 },
  modeCardSub: { ...TYPOGRAPHY.bodyMedium, fontSize: 14, color: COLORS.text.secondary },

  batchCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border.subtle },
  batchCardSelected: { borderColor: COLORS.brand.primary, backgroundColor: COLORS.brand.soft },
  batchCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  batchCardTitle: { ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary },
  batchCardSub: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.secondary, marginTop: 4 },

  paymentMethodsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  paymentCard: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: COLORS.border.subtle, marginBottom: 12 },
  paymentCardSelected: { borderColor: COLORS.brand.primary, backgroundColor: COLORS.brand.soft },
  paymentCardText: { ...TYPOGRAPHY.bodyBold, fontSize: 14, color: COLORS.text.secondary, marginTop: 12, textAlign: 'center' },
  
  cartContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border.subtle, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { ...TYPOGRAPHY.heading, fontSize: 18, color: COLORS.text.primary, marginBottom: 16 },
});
