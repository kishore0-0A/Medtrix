import React, { useState } from 'react';

import { StyleSheet, View, Text, Pressable, ScrollView, Alert, ActivityIndicator, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme';
import { useThemeContext } from '../context/ThemeContext';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';

type ImportState = 'idle' | 'uploading' | 'processing' | 'review' | 'success';

type DetectedMedicine = {
  id: string;
  name: string;
  nameTa?: string;
  nameHi?: string;
  originalText: string;
  batch: string;
  expiry: string;
  quantity: string;
  rate: string;
};

const INITIAL_MEDICINES: DetectedMedicine[] = [
  {
    id: '1',
    name: 'Amoxicillin 500mg',
    nameTa: 'அமாக்சிசிலின் 500 மி.கி',
    nameHi: 'अमोक्सिसिलिन 500mg',
    originalText: 'Amoxicillin 500mg capsules USP',
    batch: 'B-7721',
    expiry: '12/2026',
    quantity: '100 boxes',
    rate: '$5.00',
  },
  {
    id: '2',
    name: 'Paracetamol 250mg',
    nameTa: 'பாராசிட்டமால் 250 மி.கி',
    nameHi: 'पैरासिटामोल 250mg',
    originalText: 'Paracetamol 250mg oral suspension',
    batch: 'P-102',
    expiry: '08/2025',
    quantity: '50 boxes',
    rate: '$2.50',
  },
  {
    id: '3',
    name: 'Azithromycin 250mg',
    nameTa: 'அசித்ரோமைசின் 250 மி.கி',
    nameHi: 'எஸித்ரோமைசின் 250mg',
    originalText: 'Azithromycin Tablets IP 250mg',
    batch: 'AZ-4412',
    expiry: '04/2026',
    quantity: '80 boxes',
    rate: '$7.20',
  },
  {
    id: '4',
    name: 'Metformin 500mg',
    nameTa: 'மெட்ஃபோர்மின் 500 மி.கி',
    nameHi: 'मेटफॉर्मिन 500mg',
    originalText: 'Metformin HCl Prolonged Release 500mg',
    batch: 'MT-9081',
    expiry: '10/2026',
    quantity: '120 boxes',
    rate: '$3.50',
  },
  {
    id: '5',
    name: 'Cetirizine 10mg',
    nameTa: 'செடிரிசின் 10 மி.கி',
    nameHi: 'सिटिरिज़िन 10mg',
    originalText: 'Cetirizine Dihydrochloride Tablets 10mg',
    batch: 'CT-3305',
    expiry: '11/2025',
    quantity: '90 boxes',
    rate: '$2.00',
  },
  {
    id: '6',
    name: 'Pantoprazole 40mg',
    nameTa: 'பான்டோபிரசோல் 40 மி.கி',
    nameHi: 'पैंटोप्राजोल 40mg',
    originalText: 'Pantoprazole Gastro-resistant 40mg',
    batch: 'PT-6520',
    expiry: '03/2027',
    quantity: '60 boxes',
    rate: '$6.00',
  },
];

export default function BulkImportScreen() {
  const { i18n } = useTranslation();
  const { isDark, glass } = useThemeContext();
  const [importState, setImportState] = useState<ImportState>('idle');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [medicines, setMedicines] = useState<DetectedMedicine[]>(INITIAL_MEDICINES);
  const [isAdding, setIsAdding] = useState(false);

  // New item inputs
  const [newName, setNewName] = useState('');
  const [newBatch, setNewBatch] = useState('');
  const [newExp, setNewExp] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newRate, setNewRate] = useState('');

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setImportState('uploading');
        
        // Mock processing delay
        setTimeout(() => {
          setImportState('processing');
          setTimeout(() => {
            setImportState('review');
          }, 3000);
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleConfirmImport = () => {
    setImportState('success');
  };

  const handleAddMedicine = () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter a medicine name');
      return;
    }
    const newEntry: DetectedMedicine = {
      id: Date.now().toString(),
      name: newName.trim(),
      originalText: newName.trim(),
      batch: newBatch.trim() || `B-${Math.floor(1000 + Math.random() * 9000)}`,
      expiry: newExp.trim() || '12/2026',
      quantity: newQty.trim() ? `${newQty.trim()} boxes` : '50 boxes',
      rate: newRate.trim() ? (newRate.startsWith('$') ? newRate : `$${newRate}`) : '$4.00',
    };
    setMedicines(prev => [...prev, newEntry]);
    setNewName('');
    setNewBatch('');
    setNewExp('');
    setNewQty('');
    setNewRate('');
    setIsAdding(false);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const getLocalizedName = (item: DetectedMedicine) => {
    if (i18n.language === 'ta' && item.nameTa) return item.nameTa;
    if (i18n.language === 'hi' && item.nameHi) return item.nameHi;
    return item.name;
  };

  const renderHeader = () => (
    <View style={[styles.header, isDark && { backgroundColor: '#0D1117', borderBottomColor: '#1E293B' }]}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : COLORS.text.primary} />
      </Pressable>
      <View style={styles.headerTextContainer}>
        <Text style={[styles.headerTitle, isDark && { color: '#FFFFFF' }]}>Bulk Stock Import</Text>
        <Text style={[styles.headerSubtitle, isDark && { color: '#CBD5E1' }]}>Import multiple medicines from one PDF</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, isDark && { backgroundColor: '#000000' }]} edges={['top']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? '#000000' : COLORS.background.canvas} />
      <View style={[styles.bgGlowTop, isDark && { backgroundColor: '#1D4ED8', opacity: 0.15 }, { pointerEvents: 'none' }]} />
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {importState === 'idle' && (
          <Pressable style={[styles.uploadCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#2563EB' }]} onPress={handlePickDocument}>
            <View style={[styles.uploadIconCircle, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.16)' }]}>
              <Ionicons name="cloud-upload-outline" size={40} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
            </View>
            <Text style={[styles.uploadTitle, isDark && { color: '#60A5FA' }]}>Upload Invoice</Text>
            <Text style={[styles.uploadSub, isDark && { color: '#CBD5E1' }]}>Select a PDF or image file containing supplier details and medicine items.</Text>
            <View style={[styles.uploadBadge, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.20)', borderColor: '#2563EB' }]}>
              <Text style={[styles.uploadBadgeText, isDark && { color: '#60A5FA' }]}>PDF, JPG, PNG Supported</Text>
            </View>
          </Pressable>
        )}

        {(importState === 'uploading' || importState === 'processing') && (
          <View style={[styles.processingCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            <ActivityIndicator size="large" color={isDark ? '#3B82F6' : COLORS.brand.primary} />
            <Text style={[styles.processingTitle, isDark && { color: '#FFFFFF' }]}>
              {importState === 'uploading' ? 'Uploading Document...' : 'AI Analyzing Document...'}
            </Text>
            <Text style={[styles.processingSub, isDark && { color: '#CBD5E1' }]}>
              {importState === 'processing' ? 'Extracting supplier, invoice, and medicine items using OCR.' : 'Please wait.'}
            </Text>
          </View>
        )}

        {importState === 'review' && (
          <View style={styles.reviewContainer}>
            <View style={[styles.supplierCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
              <Text style={[styles.cardHeader, isDark && { color: '#60A5FA' }]}>Supplier Details</Text>
              {selectedFile?.name && (
                <Text style={[styles.detailText, isDark && { color: '#CBD5E1' }]}><Text style={styles.bold}>Document:</Text> {selectedFile.name}</Text>
              )}
              <Text style={[styles.detailText, isDark && { color: '#CBD5E1' }]}><Text style={styles.bold}>Name:</Text> Acme Pharma Distributors</Text>
              <Text style={[styles.detailText, isDark && { color: '#CBD5E1' }]}><Text style={styles.bold}>Invoice:</Text> INV-2023-991</Text>
              <Text style={[styles.detailText, isDark && { color: '#CBD5E1' }]}><Text style={styles.bold}>Total:</Text> $2,840.00</Text>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, isDark && { color: '#FFFFFF' }]}>Detected Medicines ({medicines.length})</Text>
              <Pressable style={[styles.addMedicineHeaderBtn, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.16)', borderColor: '#2563EB' }]} onPress={() => setIsAdding(!isAdding)}>
                <Ionicons name={isAdding ? "close" : "add"} size={16} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
                <Text style={[styles.addMedicineHeaderText, isDark && { color: '#60A5FA' }]}>{isAdding ? 'Cancel' : 'Add Item'}</Text>
              </Pressable>
            </View>

            {/* In-place manual entry form */}
            {isAdding && (
              <View style={[styles.addFormCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
                <Text style={[styles.addFormTitle, isDark && { color: '#60A5FA' }]}>Add Medicine Item</Text>
                
                <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Medicine Name *</Text>
                <TextInput
                  style={[styles.textInput, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B', color: '#FFFFFF' }]}
                  placeholder="e.g. Ibuprofen 400mg"
                  placeholderTextColor={isDark ? '#94A3B8' : COLORS.text.muted}
                  value={newName}
                  onChangeText={setNewName}
                />

                <View style={styles.inputRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Batch</Text>
                    <TextInput
                      style={[styles.textInput, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B', color: '#FFFFFF' }]}
                      placeholder="e.g. IB-2024"
                      placeholderTextColor={isDark ? '#94A3B8' : COLORS.text.muted}
                      value={newBatch}
                      onChangeText={setNewBatch}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Expiry</Text>
                    <TextInput
                      style={[styles.textInput, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B', color: '#FFFFFF' }]}
                      placeholder="MM/YYYY"
                      placeholderTextColor={isDark ? '#94A3B8' : COLORS.text.muted}
                      value={newExp}
                      onChangeText={setNewExp}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Quantity</Text>
                    <TextInput
                      style={[styles.textInput, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B', color: '#FFFFFF' }]}
                      placeholder="e.g. 50"
                      placeholderTextColor={isDark ? '#94A3B8' : COLORS.text.muted}
                      value={newQty}
                      onChangeText={setNewQty}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, isDark && { color: '#CBD5E1' }]}>Unit Rate</Text>
                    <TextInput
                      style={[styles.textInput, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B', color: '#FFFFFF' }]}
                      placeholder="$3.50"
                      placeholderTextColor={isDark ? '#94A3B8' : COLORS.text.muted}
                      value={newRate}
                      onChangeText={setNewRate}
                    />
                  </View>
                </View>

                <Pressable style={styles.saveNewItemBtn} onPress={handleAddMedicine}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.saveNewItemText}>Add to Import List</Text>
                </Pressable>
              </View>
            )}
            
            {medicines.map((item) => (
              <View key={item.id} style={[styles.itemCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
                <View style={styles.itemCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, isDark && { color: '#FFFFFF' }]}>{getLocalizedName(item)}</Text>
                    <Text style={[styles.itemOriginalText, isDark && { color: '#CBD5E1' }]}>Original text: {item.originalText}</Text>
                  </View>
                  {medicines.length > 1 && (
                    <Pressable style={[styles.removeBtn, isDark && { backgroundColor: 'rgba(37, 99, 235, 0.16)' }]} onPress={() => handleRemoveMedicine(item.id)}>
                      <Ionicons name="trash-outline" size={16} color={isDark ? '#60A5FA' : COLORS.status.critical} />
                    </Pressable>
                  )}
                </View>

                <View style={styles.itemRow}>
                  <View style={[styles.badgeChip, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B' }]}>
                    <Text style={[styles.badgeChipLabel, isDark && { color: '#94A3B8' }]}>BATCH</Text>
                    <Text style={[styles.badgeChipValue, isDark && { color: '#FFFFFF' }]}>{item.batch}</Text>
                  </View>
                  <View style={[styles.badgeChip, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B' }]}>
                    <Text style={[styles.badgeChipLabel, isDark && { color: '#94A3B8' }]}>EXP</Text>
                    <Text style={[styles.badgeChipValue, isDark && { color: '#FFFFFF' }]}>{item.expiry}</Text>
                  </View>
                </View>

                <View style={[styles.itemRow, { marginTop: 6 }]}>
                  <View style={[styles.badgeChip, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B' }]}>
                    <Text style={[styles.badgeChipLabel, isDark && { color: '#94A3B8' }]}>QTY</Text>
                    <Text style={[styles.badgeChipValue, isDark && { color: '#FFFFFF' }]}>{item.quantity}</Text>
                  </View>
                  <View style={[styles.badgeChip, isDark && { backgroundColor: '#080B12', borderColor: '#1E293B' }]}>
                    <Text style={[styles.badgeChipLabel, isDark && { color: '#94A3B8' }]}>RATE</Text>
                    <Text style={[styles.badgeChipValue, isDark && { color: '#FFFFFF' }]}>{item.rate}</Text>
                  </View>
                </View>
              </View>
            ))}

            <Pressable style={styles.primaryButton} onPress={handleConfirmImport}>
              <Text style={styles.primaryButtonText}>Confirm & Import Stock ({medicines.length})</Text>
            </Pressable>
          </View>
        )}

        {importState === 'success' && (
          <View style={[styles.processingCard, glass.standard, isDark && { backgroundColor: '#0D1117', borderColor: '#1E293B' }]}>
            <Ionicons name="checkmark-circle" size={64} color={isDark ? '#60A5FA' : COLORS.status.healthy} />
            <Text style={[styles.processingTitle, isDark && { color: '#FFFFFF' }]}>Import Successful</Text>
            <Text style={[styles.processingSub, isDark && { color: '#CBD5E1' }]}>{medicines.length} medicine items and batch records were added to your inventory.</Text>
            <Pressable style={[styles.primaryButton, { marginTop: 24, width: '100%' }]} onPress={() => router.replace('/(tabs)/inventory')}>
              <Text style={styles.primaryButtonText}>View Inventory</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background.canvas },
  bgGlowTop: {
    position: 'absolute',
    top: -50,
    left: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.brand.soft,
    opacity: 0.4,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
  },
  backButton: { marginRight: 14, padding: 4, borderRadius: 12 },
  headerTextContainer: { flex: 1 },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 22, color: COLORS.text.primary, letterSpacing: -0.4 },
  headerSubtitle: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text.secondary },
  
  content: { padding: 20, paddingBottom: 100 },
  
  uploadCard: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.brand.primary + '40',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
    ...SHADOWS.soft,
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.brand.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: { ...TYPOGRAPHY.heading, fontSize: 20, color: COLORS.brand.primary, marginBottom: 8 },
  uploadSub: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text.secondary, textAlign: 'center', paddingHorizontal: 16, lineHeight: 18 },
  uploadBadge: {
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.brand.verySoft,
    borderWidth: 1,
    borderColor: COLORS.brand.verySoft,
  },
  uploadBadgeText: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 11,
    color: COLORS.brand.primary,
  },

  processingCard: { alignItems: 'center', padding: 36, borderRadius: 22, ...SHADOWS.soft },
  processingTitle: { ...TYPOGRAPHY.heading, fontSize: 19, color: COLORS.text.primary, marginTop: 18, marginBottom: 8 },
  processingSub: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 18 },

  reviewContainer: { flex: 1 },
  supplierCard: { padding: 20, borderRadius: 18, marginBottom: 20, ...SHADOWS.soft },
  cardHeader: { ...TYPOGRAPHY.heading, fontSize: 17, color: COLORS.brand.primary, marginBottom: 12 },
  detailText: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.primary, marginBottom: 6 },
  bold: { fontFamily: 'Outfit-Bold', fontWeight: '600' },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { ...TYPOGRAPHY.heading, fontSize: 17, color: COLORS.text.primary },
  addMedicineHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand.verySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.brand.primary + '30',
  },
  addMedicineHeaderText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: COLORS.brand.primary,
    marginLeft: 4,
  },

  addFormCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.brand.primary + '40',
    backgroundColor: COLORS.brand.verySoft,
    ...SHADOWS.soft,
  },
  addFormTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 15,
    color: COLORS.brand.primary,
    marginBottom: 12,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveNewItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  saveNewItemText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
    fontSize: 13,
  },
  
  itemCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  itemCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemName: { ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary, marginBottom: 2 },
  itemOriginalText: { fontSize: 11, color: COLORS.text.muted },
  removeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.status.criticalBg,
    marginLeft: 8,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  badgeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.canvas,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  badgeChipLabel: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 9,
    color: COLORS.text.muted,
  },
  badgeChipValue: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.text.primary,
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    ...SHADOWS.soft,
  },
  primaryButtonText: { ...TYPOGRAPHY.bodyBold, color: '#fff', fontSize: 15 },
});
