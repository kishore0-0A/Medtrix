import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View, Text, Pressable, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { COLORS, TYPOGRAPHY, GLASS } from '../../theme';

import { ScannerService } from '../../services/cv/ScannerService';
import { FrontendResultModel } from '../../services/cv/models';
import { Database } from '../../supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type ScanState = 'camera' | 'preview' | 'processing' | 'ocr_review' | 'quantity_input' | 'final_review' | 'saving' | 'success';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('camera');
  const [result, setResult] = useState<FrontendResultModel | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  // Auto-requesting permissions in useEffect can sometimes cause React state update warnings
  // during Expo Router's initial mount/linking phase. We rely on the button instead.

  const handleTakePhoto = async () => {
    if (!cameraReady) return;
    try {
      const picture = await cameraRef.current?.takePictureAsync({
        quality: 0.82,
        skipProcessing: false,
      });
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

  const handleConfirmOcr = () => {
    console.log("========== BEFORE CONFIRM VALIDATION ==========");
    console.log({
      medicineName,
      batchNumber,
      expDate,
    });
    
    if (!medicineName.trim() || !batchNumber.trim() || !expDate.trim()) {
      Alert.alert('Validation Error', 'Medicine Name, Batch Number, and Expiry Date are required.');
      return;
    }
    setScanState('quantity_input');
  };

  const handleConfirmQuantity = () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Validation Error', 'Enter a valid quantity greater than zero.');
      return;
    }
    
    // Update result with edited values
    if (result) {
      result.medicine.name = medicineName;
      result.medicine.genericName = genericName;
      result.medicine.activeIngredient = activeIngredient;
      result.medicine.composition = composition;
      result.medicine.strength = strength;
      result.medicine.form = form;
      
      result.batch.batchNumber = batchNumber;
      result.batch.lotNumber = lotNumber;
      result.batch.manufacturingDate = mfgDate;
      result.batch.expiryDate = expDate;
      
      result.batch.mrp = mrp ? parseFloat(mrp) : undefined;
      result.batch.currency = currency;

      result.medicine.manufacturer = manufacturer;
      result.medicine.manufacturerAddress = manufacturerAddress;
      result.medicine.manufacturingLicenseNumber = manufacturingLicenseNumber;

      result.pack.packSize = packSize ? parseInt(packSize, 10) : undefined;
      result.pack.packUnit = packUnit;

      result.identification.barcode = barcode;
      result.identification.gtin = gtin;
      result.identification.qrCode = qrCode;

      result.safety.storageInstructions = storageInstructions;
      result.safety.prescriptionInfo = prescriptionInfo;
      result.safety.warnings = warnings;

      result.contact.customerCare = customerCare;
      result.contact.website = website;

      result.quantity.totalCalculated = qty;
    }
    setScanState('final_review');
  };

  const handleSaveToInventory = async () => {
    if (!result) return;
    setScanState('saving');
    
    const { error } = await Database.saveScannedMedicine(result);
    
    if (error) {
      console.error(error);
      setScanState('final_review');
      Alert.alert('Save Failed', 'Unable to save inventory. Your stock was not added.');
      return;
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
      {scanState === 'camera' && (
        <View style={styles.fullFlex}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Smart Medicine Scan</Text>
            <Text style={styles.headerSubtitle}>Scan a medicine package to extract its details</Text>
          </View>
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              onCameraReady={() => setCameraReady(true)}
            />
            <View style={styles.scanFrameOverlay}>
               <View style={styles.scanFrame}>
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
          </View>
        </View>
      )}

      {scanState === 'preview' && (
        <View style={styles.fullFlex}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Review Photo</Text>
          </View>
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Review Medicine Details</Text>
            <Text style={styles.headerSubtitle}>Verify the detected information before adding stock.</Text>
          </View>
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

      {scanState === 'quantity_input' && (
        <View style={styles.fullFlex}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Stock</Text>
            <Text style={styles.headerSubtitle}>How many units are being added to inventory?</Text>
          </View>
          <View style={styles.centerContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{medicineName}</Text>
              <Text style={styles.summarySub}>{strength} {form}</Text>
              <Text style={styles.summarySub}>Batch {batchNumber}</Text>
              {packSize ? <Text style={styles.summarySub}>Pack Size: {packSize} {packUnit}</Text> : null}
            </View>
            <Text style={styles.quantityLabel}>Quantity Received</Text>
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
            <Pressable style={styles.secondaryButtonFlex} onPress={() => setScanState('ocr_review')}>
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Confirm Inventory Entry</Text>
            <Text style={styles.headerSubtitleWarning}>Please verify the information before adding this stock.</Text>
          </View>
          <ScrollView contentContainerStyle={[styles.scrollContent, {paddingBottom: 150}]}>
            <View style={styles.finalCard}>
              <View style={styles.finalRow}><Text style={styles.finalLabel}>Medicine</Text><Text style={styles.finalValue}>{medicineName}</Text></View>
              {genericName ? <View style={styles.finalRow}><Text style={styles.finalLabel}>Generic</Text><Text style={styles.finalValue}>{genericName}</Text></View> : null}
              {form ? <View style={styles.finalRow}><Text style={styles.finalLabel}>Form</Text><Text style={styles.finalValue}>{form}</Text></View> : null}
              <View style={styles.finalRow}><Text style={styles.finalLabel}>Batch</Text><Text style={styles.finalValueMono}>{batchNumber}</Text></View>
              {mfgDate ? <View style={styles.finalRow}><Text style={styles.finalLabel}>MFG</Text><Text style={styles.finalValue}>{mfgDate}</Text></View> : null}
              <View style={styles.finalRow}><Text style={styles.finalLabel}>EXP</Text><Text style={styles.finalValue}>{expDate}</Text></View>
              {mrp ? <View style={styles.finalRow}><Text style={styles.finalLabel}>MRP</Text><Text style={styles.finalValue}>{currency} {mrp}</Text></View> : null}
              {manufacturer ? <View style={styles.finalRow}><Text style={styles.finalLabel}>Manufacturer</Text><Text style={styles.finalValue}>{manufacturer}</Text></View> : null}
              {packSize ? <View style={styles.finalRow}><Text style={styles.finalLabel}>Pack</Text><Text style={styles.finalValue}>{packSize} {packUnit}</Text></View> : null}
              <View style={[styles.finalRow, {borderBottomWidth: 0}]}><Text style={styles.finalLabel}>Quantity</Text><Text style={styles.finalValueBold}>{quantity} units</Text></View>
            </View>
          </ScrollView>
          <View style={styles.bottomActionsAbsoluteRow}>
            <Pressable style={styles.secondaryButtonFlex} onPress={() => setScanState('quantity_input')}>
              <Text style={styles.secondaryButtonText}>Back & Edit</Text>
            </Pressable>
            <Pressable style={styles.primaryButtonFlex} onPress={handleSaveToInventory}>
              <Text style={styles.primaryButtonText}>Confirm & Add to Inventory</Text>
            </Pressable>
          </View>
        </View>
      )}

      {scanState === 'saving' && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.titleText}>Saving Inventory</Text>
          <Text style={styles.subText}>Updating stock...</Text>
        </View>
      )}

      {scanState === 'success' && (
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.status.healthy} />
          <Text style={styles.titleText}>Stock Added Successfully</Text>
          
          <View style={styles.successCard}>
            <Text style={styles.summaryTitle}>{medicineName} {strength}</Text>
            <Text style={styles.summarySub}>Batch: <Text style={TYPOGRAPHY.monoBold}>{batchNumber}</Text></Text>
            <View style={styles.divider} />
            <Text style={styles.summarySub}>Quantity Added: <Text style={{color: COLORS.status.healthy, ...TYPOGRAPHY.bodyBold}}>+{quantity}</Text></Text>
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
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 24, color: COLORS.text.primary, marginBottom: 8, textAlign: 'center' },
  headerSubtitle: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },
  headerSubtitleWarning: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.status.warning, textAlign: 'center' },
  
  cameraContainer: { flex: 1, margin: 16, borderRadius: 24, overflow: 'hidden' },
  scanFrameOverlay: { ...StyleSheet.absoluteFill as object, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 280, height: 180, borderWidth: 2, borderColor: COLORS.brand.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(37, 99, 235, 0.1)' },
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

  permissionText: { ...TYPOGRAPHY.heading, fontSize: 20, marginBottom: 10 },
  permissionSub: { ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: 24, color: COLORS.text.secondary },

  titleText: { ...TYPOGRAPHY.heading, fontSize: 22, color: COLORS.text.primary, marginTop: 24, marginBottom: 8 },
  subText: { ...TYPOGRAPHY.body, color: COLORS.text.secondary, textAlign: 'center' },
  errorText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.status.critical, textAlign: 'center', marginTop: 10 },

  scrollContent: { padding: 20, paddingBottom: 150 },
  sectionHeader: { ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.brand.deep, marginTop: 16, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border.subtle, paddingBottom: 4 },
  inputGroup: { marginBottom: 16 },
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
  divider: { height: 1, backgroundColor: COLORS.border.subtle, marginVertical: 12 }
});
