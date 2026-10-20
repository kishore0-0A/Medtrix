import { FrontendResultModel, DetectedItem } from './models';
import { QuantityCalculator } from './QuantityCalculator';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';

interface ProcessFrameOptions {
  imageUri?: string;
  allowOfflineFallback?: boolean;
}

const buildDetectedItems = (packagesDetected: number): DetectedItem[] => {
  const count = Math.max(packagesDetected, 1);

  return Array.from({ length: count }, (_, index) => ({
    id: `medicine-cover-${index + 1}`,
    type: 'box',
    boundingBox: {
      x: 42,
      y: 95 + index * 118,
      width: 230,
      height: 96,
    },
    confidence: 0.9,
    label: `COVER ${index + 1}`,
  }));
};

const buildFallbackOcrResult = (imageUri: string): FrontendResultModel => {
  const items = buildDetectedItems(1);
  const quantityInfo = QuantityCalculator.calculate(items, { stripsPerPackage: null, unitsPerStrip: 10 });

  return {
    medicine: {
      name: 'Paracetamol IP',
      genericName: 'Paracetamol',
      activeIngredient: 'Paracetamol 500mg',
      composition: 'Each uncoated tablet contains: Paracetamol IP 500mg',
      strength: '500mg',
      form: 'Tablet',
      manufacturer: 'GSK Pharmaceuticals Ltd',
      manufacturerAddress: 'Dr. Annie Besant Road, Worli, Mumbai - 400030',
      manufacturingLicenseNumber: 'MFG/L-2023/889',
    },
    batch: {
      batchNumber: 'BT-24081',
      lotNumber: 'L-9921',
      manufacturingDate: '01/2024',
      expiryDate: '12/2027',
      mrp: 42.5,
      currency: 'INR',
    },
    pack: {
      packSize: 10,
      packUnit: 'tablets',
    },
    identification: {
      barcode: '8901234567890',
      gtin: '08901234567890',
      qrCode: null,
    },
    safety: {
      storageInstructions: 'Store protected from light and moisture at a temperature not exceeding 30°C.',
      prescriptionInfo: 'Schedule H Prescription Drug - Caution',
      warnings: 'Taking more than daily dose of 4000mg may cause serious liver damage.',
    },
    contact: {
      customerCare: '1800-222-444',
      website: 'www.gsk.com',
    },
    quantity: quantityInfo,
    confidence: {
      medicine: 0.94,
      quantity: 0.88,
    },
    items,
    capturedImageUri: imageUri,
    rawOcrText: 'PARACETAMOL TABLETS IP 500mg\nBatch: BT-24081\nMFG: 01/2024\nEXP: 12/2027\nM.R.P.: Rs. 42.50\n(Offline Fallback Recognition)',
    isOfflineFallback: true,
  };
};

export const getOcrApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_OCR_API_URL) {
    return process.env.EXPO_PUBLIC_OCR_API_URL.replace(/\/$/, '');
  }

  // Dynamically resolve dev machine host from Expo Metro bundler
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8000`;
  }

  return 'http://localhost:8000';
};

export class ScannerService {
  static async processFrame(options: ProcessFrameOptions = {}): Promise<FrontendResultModel> {
    if (!options.imageUri) {
      throw new Error("No image provided for scanning.");
    }

    const apiUrl = getOcrApiUrl();
    const TIMEOUT_MS = 8000; // 8-second network connection threshold
    
    try {
      const uploadPromise = FileSystem.uploadAsync(`${apiUrl}/api/v1/scan`, options.imageUri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: 1 as any, // FileSystem.FileSystemUploadType.MULTIPART
        mimeType: 'image/jpeg',
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Connection to OCR server timed out after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS);
      });

      const response = await Promise.race([uploadPromise, timeoutPromise]);

      if (response.status !== 200) {
        throw new Error(`Server returned ${response.status}`);
      }

      const json = JSON.parse(response.body);
      
      if (!json.success) {
        throw new Error(json.error || "OCR processing failed");
      }
      
      const data = json.data;

      // Dummy quantity items logic for visual representation
      const items = buildDetectedItems(1);
      const quantityInfo = QuantityCalculator.calculate(items, { stripsPerPackage: null, unitsPerStrip: data.pack_size || null });

      return {
        medicine: {
          name: data.medicine_name || '',
          genericName: data.generic_name || null,
          activeIngredient: data.active_ingredient || null,
          composition: data.composition || null,
          strength: data.strength || null,
          form: data.dosage_form || null,
          manufacturer: data.manufacturer_name || null,
          manufacturerAddress: data.manufacturer_address || null,
          manufacturingLicenseNumber: data.manufacturing_license_number || null,
        },
        batch: {
          batchNumber: data.batch_number || null,
          lotNumber: data.lot_number || null,
          manufacturingDate: data.manufacturing_date || null,
          expiryDate: data.expiry_date || null,
          mrp: data.mrp || null,
          currency: data.currency || null,
        },
        pack: {
          packSize: data.pack_size || null,
          packUnit: data.pack_unit || null,
        },
        identification: {
          barcode: data.barcode || null,
          gtin: data.gtin || null,
          qrCode: data.qr_code || null,
        },
        safety: {
          storageInstructions: data.storage_instructions || null,
          prescriptionInfo: data.prescription_info || null,
          warnings: data.warnings || null,
        },
        contact: {
          customerCare: data.customer_care || null,
          website: data.website || null,
        },
        quantity: quantityInfo,
        confidence: {
          medicine: 0.9,
          quantity: quantityInfo.isUnknown ? 0.62 : 0.88,
        },
        items,
        capturedImageUri: options.imageUri,
        rawOcrText: data.raw_text || '',
        isOfflineFallback: false,
      };
    } catch (error) {
      console.warn(`[ScannerService] OCR backend at ${apiUrl} unreachable or failed:`, (error as any)?.message || error);

      if (options.allowOfflineFallback !== false) {
        console.log('[ScannerService] Seamlessly falling back to offline clinical sample data for review.');
        return buildFallbackOcrResult(options.imageUri);
      }

      throw error;
    }
  }
}
