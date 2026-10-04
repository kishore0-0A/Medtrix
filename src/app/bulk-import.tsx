import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS } from '../theme';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

type ImportState = 'idle' | 'uploading' | 'processing' | 'review' | 'success';

export default function BulkImportScreen() {
  const { t, i18n } = useTranslation();
  const [importState, setImportState] = useState<ImportState>('idle');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

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
    // In a real implementation, this would save the confirmed items to Supabase
    setImportState('success');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color={COLORS.text.primary} />
      </Pressable>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerTitle}>Bulk Stock Import</Text>
        <Text style={styles.headerSubtitle}>Import multiple medicines from one PDF</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bgGlowTop} pointerEvents="none" />
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content}>
        {importState === 'idle' && (
          <Pressable style={[styles.uploadCard, GLASS.standard]} onPress={handlePickDocument}>
            <Ionicons name="cloud-upload-outline" size={48} color={COLORS.brand.primary} />
            <Text style={styles.uploadTitle}>Upload Invoice</Text>
            <Text style={styles.uploadSub}>Select a PDF or image file containing supplier details and medicine items.</Text>
          </Pressable>
        )}

        {(importState === 'uploading' || importState === 'processing') && (
          <View style={[styles.processingCard, GLASS.standard]}>
            <ActivityIndicator size="large" color={COLORS.brand.primary} />
            <Text style={styles.processingTitle}>
              {importState === 'uploading' ? 'Uploading Document...' : 'AI Analyzing Document...'}
            </Text>
            <Text style={styles.processingSub}>
              {importState === 'processing' ? 'Extracting supplier, invoice, and medicine items using OCR.' : 'Please wait.'}
            </Text>
          </View>
        )}

        {importState === 'review' && (
          <View style={styles.reviewContainer}>
            <View style={[styles.supplierCard, GLASS.standard]}>
              <Text style={styles.cardHeader}>Supplier Details</Text>
              <Text style={styles.detailText}><Text style={styles.bold}>Name:</Text> Acme Pharma Distributors</Text>
              <Text style={styles.detailText}><Text style={styles.bold}>Invoice:</Text> INV-2023-991</Text>
              <Text style={styles.detailText}><Text style={styles.bold}>Total:</Text> $1,250.00</Text>
            </View>

            <Text style={styles.sectionTitle}>Detected Medicines (2)</Text>
            
            <View style={[styles.itemCard, GLASS.secondary]}>
              <Text style={styles.itemName}>{i18n.language === 'ta' ? 'அமாக்சிசிலின் 500 மி.கி' : i18n.language === 'hi' ? 'अमोक्सिसिलिन 500mg' : 'Amoxicillin 500mg'}</Text>
              <Text style={{ fontSize: 12, color: COLORS.text.muted }}>Original text: Amoxicillin 500mg</Text>
              <View style={styles.itemRow}>
                <Text style={styles.itemDetail}>Batch: B-7721</Text>
                <Text style={styles.itemDetail}>Exp: 12/2026</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemDetail}>Qty: 100 boxes</Text>
                <Text style={styles.itemDetail}>Rate: $5.00</Text>
              </View>
            </View>

            <View style={[styles.itemCard, GLASS.secondary]}>
              <Text style={styles.itemName}>{i18n.language === 'ta' ? 'பாராசிட்டமால் 250 மி.கி' : i18n.language === 'hi' ? 'पैरासिटामोल 250mg' : 'Paracetamol 250mg'}</Text>
              <Text style={{ fontSize: 12, color: COLORS.text.muted }}>Original text: Paracetamol 250mg</Text>
              <View style={styles.itemRow}>
                <Text style={styles.itemDetail}>Batch: P-102</Text>
                <Text style={styles.itemDetail}>Exp: 08/2025</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemDetail}>Qty: 50 boxes</Text>
                <Text style={styles.itemDetail}>Rate: $2.50</Text>
              </View>
            </View>

            <Pressable style={styles.primaryButton} onPress={handleConfirmImport}>
              <Text style={styles.primaryButtonText}>Confirm & Import Stock</Text>
            </Pressable>
          </View>
        )}

        {importState === 'success' && (
          <View style={[styles.processingCard, GLASS.standard]}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.status.healthy} />
            <Text style={styles.processingTitle}>Import Successful</Text>
            <Text style={styles.processingSub}>2 medicine items and batch records were added to your inventory.</Text>
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
  bgGlowTop: { position: 'absolute', top: -100, left: -50, right: -50, height: 300, backgroundColor: 'rgba(37, 99, 235, 0.15)', borderRadius: 200, transform: [{ scaleY: 0.5 }], filter: 'blur(40px)' },
  
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { marginRight: 16, padding: 4, borderRadius: 20 },
  headerTextContainer: { flex: 1 },
  headerTitle: { ...TYPOGRAPHY.heading, fontSize: 24, color: COLORS.text.primary, marginBottom: 4 },
  headerSubtitle: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.secondary },
  
  content: { padding: 20, paddingBottom: 100 },
  
  uploadCard: { alignItems: 'center', padding: 40, borderRadius: 24, borderWidth: 2, borderColor: COLORS.brand.verySoft, borderStyle: 'dashed', backgroundColor: 'rgba(37, 99, 235, 0.05)' },
  uploadTitle: { ...TYPOGRAPHY.heading, fontSize: 20, color: COLORS.brand.primary, marginTop: 16, marginBottom: 8 },
  uploadSub: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', paddingHorizontal: 20 },

  processingCard: { alignItems: 'center', padding: 40, borderRadius: 24 },
  processingTitle: { ...TYPOGRAPHY.heading, fontSize: 20, color: COLORS.text.primary, marginTop: 20, marginBottom: 8 },
  processingSub: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },

  reviewContainer: { flex: 1 },
  supplierCard: { padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border.subtle },
  cardHeader: { ...TYPOGRAPHY.heading, fontSize: 18, color: COLORS.brand.primary, marginBottom: 12 },
  detailText: { ...TYPOGRAPHY.body, fontSize: 15, color: COLORS.text.primary, marginBottom: 6 },
  bold: { fontFamily: 'Outfit-Bold', fontWeight: '600' },

  sectionTitle: { ...TYPOGRAPHY.heading, fontSize: 18, color: COLORS.text.primary, marginBottom: 12, marginTop: 8 },
  
  itemCard: { padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border.subtle },
  itemName: { ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemDetail: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text.secondary },

  primaryButton: { backgroundColor: COLORS.brand.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 24, shadowColor: COLORS.brand.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { ...TYPOGRAPHY.bodyBold, color: '#fff', fontSize: 16 },
});
