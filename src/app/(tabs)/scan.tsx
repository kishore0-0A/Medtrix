import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, TYPOGRAPHY } from '../../theme';

import { ScannerService } from '../../services/cv/ScannerService';
import { FrontendResultModel } from '../../services/cv/models';

import { LiquidGlassControls } from '../../components/scanner/LiquidGlassControls';
import { ScannerOverlay } from '../../components/scanner/ScannerOverlay';
import { QuantityCounter } from '../../components/scanner/QuantityCounter';
import { ScanResult } from '../../components/scanner/ScanResult';
import { router } from 'expo-router';

type ScanState = 'ready' | 'processing' | 'result';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [activeTab, setActiveTab] = useState('OCR Text');
  const [scanState, setScanState] = useState<ScanState>('ready');
  const [result, setResult] = useState<FrontendResultModel | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScan = async () => {
    if (scanState !== 'ready') return;
    
    setScanState('processing');
    try {
      // In a real app, we would capture the frame from the CameraView here
      const res = await ScannerService.processFrame();
      setResult(res);
      setScanState('result');
    } catch (error) {
      setScanState('ready');
      console.error(error);
    }
  };

  const handleConfirm = () => {
    // Navigate to Inventory or Review screen
    // For now we'll reset
    setScanState('ready');
    setResult(null);
    router.navigate('/inventory'); // assuming this route exists based on directory listing
  };

  const handleEdit = () => {
    // Navigate to manual edit mode, placeholder for now
    console.log('Edit quantity');
  };

  const handleRescan = () => {
    setScanState('ready');
    setResult(null);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Medicine Scanner</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, scanState === 'processing' ? styles.statusProcessing : scanState === 'result' ? styles.statusSuccess : {}]} />
          <Text style={styles.statusText}>
            {scanState === 'ready' ? 'Camera Ready' : scanState === 'processing' ? 'Detecting Medicine...' : 'Medicine Identified'}
          </Text>
        </View>
      </View>

      <LiquidGlassControls 
        tabs={['Barcode', 'Auto Detect', 'OCR Text']} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
        
        <ScannerOverlay 
          isScanning={scanState === 'processing'} 
          items={result?.items || []} 
        />

        {scanState === 'ready' && (
          <Pressable style={styles.captureButton} onPress={handleScan}>
            <Text style={styles.captureButtonText}>Scan Medicine</Text>
          </Pressable>
        )}
      </View>

      {/* Overlays based on state */}
      {scanState === 'processing' && (
        <QuantityCounter quantity={null} /> // Could pass live quantity if processing was continuous
      )}

      {scanState === 'result' && result && (
        <ScanResult 
          result={result} 
          onConfirm={handleConfirm} 
          onEdit={handleEdit} 
          onRescan={handleRescan} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.canvas,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    color: COLORS.text.primary,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: 6,
  },
  statusProcessing: {
    backgroundColor: COLORS.brand.primary,
  },
  statusSuccess: {
    backgroundColor: '#10B981',
  },
  statusText: {
    ...TYPOGRAPHY.mono,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  captureButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  captureButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: COLORS.brand.primary,
    padding: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});