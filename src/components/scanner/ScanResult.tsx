import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, GLASS, SHADOWS } from '../../theme';
import { FrontendResultModel } from '../../services/cv/models';

interface ScanResultProps {
  result: FrontendResultModel;
  onConfirm: () => void;
  onEdit: () => void;
  onRescan: () => void;
}

export function ScanResult({ result, onConfirm, onEdit, onRescan }: ScanResultProps) {
  return (
    <View style={[styles.resultPanel, GLASS.hero]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Medicine Detected Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>MEDICINE DETECTED</Text>
          <Text style={styles.medicineName}>{result.medicine.name} {result.medicine.strength}</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Batch</Text>
              <Text style={styles.detailValue}>{result.batch.batchNumber || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>EXP</Text>
              <Text style={styles.detailValue}>{result.batch.expiryDate || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>MRP</Text>
              <Text style={styles.detailValue}>₹{result.batch.mrp || 'N/A'}</Text>
            </View>
          </View>
          
          <Text style={styles.confidenceText}>OCR Confidence {Math.round(result.confidence.medicine * 100)}%</Text>
        </View>

        <View style={styles.divider} />

        {/* Quantity Detected Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>QUANTITY DETECTED</Text>
          
          {result.quantity.packagesDetected > 0 && (
            <Text style={styles.quantityBreakdown}>{result.quantity.packagesDetected} Packages</Text>
          )}
          {result.quantity.stripsPerPackage && (
            <Text style={styles.quantityBreakdown}>× {result.quantity.stripsPerPackage} Strips / Package</Text>
          )}
          {result.quantity.unitsPerStrip && (
            <Text style={styles.quantityBreakdown}>× {result.quantity.unitsPerStrip} Tablets / Strip</Text>
          )}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{result.quantity.totalCalculated || 'UNKNOWN'} TABLETS</Text>
          </View>

          <Text style={styles.confidenceText}>CV Confidence {Math.round(result.confidence.quantity * 100)}%</Text>
          
          {result.confidence.quantity < 0.8 && (
            <Text style={styles.warningText}>⚠ Please verify quantity</Text>
          )}
        </View>

      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Pressable style={styles.primaryButton} onPress={onConfirm}>
          <Text style={styles.primaryButtonText}>Confirm & Add to Inventory</Text>
        </Pressable>

        <View style={styles.secondaryActionsRow}>
          <Pressable style={styles.secondaryButton} onPress={onEdit}>
            <Text style={styles.secondaryButtonText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onRescan}>
            <Text style={styles.secondaryButtonText}>Rescan</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resultPanel: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    maxHeight: '75%',
    padding: 20,
    borderRadius: 24,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 12,
    color: COLORS.text.muted,
    marginBottom: 12,
    letterSpacing: 1,
  },
  medicineName: {
    ...TYPOGRAPHY.heading,
    fontSize: 20,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.mono,
    fontSize: 10,
    color: COLORS.text.muted,
    marginBottom: 4,
  },
  detailValue: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  confidenceText: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.brand.primary,
  },
  warningText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12,
    color: '#F59E0B', // Amber
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.subtle,
    marginVertical: 16,
  },
  quantityBreakdown: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 15,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  totalContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  totalLabel: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 12,
    color: COLORS.text.muted,
    marginBottom: 4,
  },
  totalValue: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    color: COLORS.brand.primary,
  },
  actionsContainer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.brand.primary,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.text.primary,
  },
});
