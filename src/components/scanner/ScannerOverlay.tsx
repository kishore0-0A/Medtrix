import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme';
import { DetectedItem } from '../../services/cv/models';

interface ScannerOverlayProps {
  items: DetectedItem[];
  isScanning: boolean;
}

export function ScannerOverlay({ items, isScanning }: ScannerOverlayProps) {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation;
    if (isScanning) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0, // Snap back to top
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      scanLineAnim.setValue(0);
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isScanning, scanLineAnim]);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250], // Assuming the scanning frame is 250px tall
  });

  return (
    <View style={[styles.overlayContainer, { pointerEvents: 'none' }]}>


      {/* Render Bounding Boxes */}
      {items.map((item) => {
        let borderColor = COLORS.brand.primary; // Blue for standard boxes
        if (item.type === 'barcode') borderColor = '#10B981'; // Green for barcode
        if (item.confidence < 0.8) borderColor = '#F59E0B'; // Amber for low confidence

        return (
          <View
            key={item.id}
            style={[
              styles.boundingBox,
              {
                left: item.boundingBox.x,
                top: item.boundingBox.y,
                width: item.boundingBox.width,
                height: item.boundingBox.height,
                borderColor,
              },
            ]}
          >
            {item.label && (
              <View style={[styles.labelContainer, { backgroundColor: borderColor }]}>
                <Text style={styles.labelText}>{item.label}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill as object,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scannerBracketTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3, borderColor: COLORS.brand.primary, borderTopLeftRadius: 16 },
  scannerBracketTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 3, borderRightWidth: 3, borderColor: COLORS.brand.primary, borderTopRightRadius: 16 },
  scannerBracketBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: COLORS.brand.primary, borderBottomLeftRadius: 16 },
  scannerBracketBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3, borderColor: COLORS.brand.primary, borderBottomRightRadius: 16 },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: COLORS.brand.primary,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(37,99,235,0.1)', // Subtle blue tint
  },
  labelContainer: {
    position: 'absolute',
    top: -20,
    left: -2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  labelText: {
    ...TYPOGRAPHY.monoBold,
    fontSize: 10,
    color: '#FFFFFF',
  },
});
