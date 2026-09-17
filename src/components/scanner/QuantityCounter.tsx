import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, GLASS, SHADOWS } from '../../theme';
import { QuantityInfo } from '../../services/cv/models';

interface QuantityCounterProps {
  quantity: QuantityInfo | null;
}

export function QuantityCounter({ quantity }: QuantityCounterProps) {
  if (!quantity) return null;

  return (
    <View style={styles.counterPanel}>
      <Text style={styles.counterTitle}>QUANTITY DETECTED</Text>
      
      <View style={styles.counterDetails}>
        {quantity.packagesDetected > 0 && (
          <Text style={styles.counterText}>{quantity.packagesDetected} packages</Text>
        )}
        {quantity.stripsDetected > 0 && (
          <Text style={styles.counterText}>{quantity.stripsDetected} strips</Text>
        )}
        {quantity.unitsDetected > 0 && (
          <Text style={styles.counterText}>{quantity.unitsDetected} units</Text>
        )}
        
        {quantity.totalCalculated !== null && (
          <Text style={styles.counterTotal}>{quantity.totalCalculated} tablets</Text>
        )}
        
        {quantity.isUnknown && (
          <Text style={styles.counterWarning}>Pack size unknown</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  counterPanel: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    padding: 16,
    width: 250,
    ...SHADOWS.soft,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  counterTitle: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 10,
    color: COLORS.text.muted,
    marginBottom: 8,
  },
  counterDetails: {
    gap: 4,
  },
  counterText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  counterTotal: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: COLORS.brand.primary,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
  },
  counterWarning: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
  },
});
