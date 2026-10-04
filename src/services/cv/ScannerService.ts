import { FrontendResultModel, DetectedItem } from './models';
import { QuantityCalculator } from './QuantityCalculator';
import * as FileSystem from 'expo-file-system/legacy';

interface ProcessFrameOptions {
  imageUri?: string;
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

export class ScannerService {
  static async processFrame(options: ProcessFrameOptions = {}): Promise<FrontendResultModel> {
    if (!options.imageUri) {
      throw new Error("No image provided for scanning.");
    }

    const apiUrl = process.env.EXPO_PUBLIC_OCR_API_URL || 'http://192.168.1.10:8000';
    
    try {
      const uploadPromise = FileSystem.uploadAsync(`${apiUrl}/api/v1/scan`, options.imageUri, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: 1 as any, // FileSystem.FileSystemUploadType.MULTIPART
        mimeType: 'image/jpeg',
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 60000); // 60-second timeout
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
      };
    } catch (error) {
      console.error("OCR Service Error:", error);
      throw error;
    }
  }
}
