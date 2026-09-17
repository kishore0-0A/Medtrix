import { FrontendResultModel, DetectedItem } from './models';
import { QuantityCalculator } from './QuantityCalculator';

export class ScannerService {
  // Simulates processing a camera frame
  static async processFrame(): Promise<FrontendResultModel> {
    return new Promise((resolve) => {
      // Simulate processing time
      setTimeout(() => {
        // Mock CV items detected (e.g., 4 boxes)
        const mockItems: DetectedItem[] = [
          {
            id: 'box-1',
            type: 'box',
            boundingBox: { x: 50, y: 100, width: 200, height: 100 },
            confidence: 0.95,
            label: 'BOX 1',
          },
          {
            id: 'box-2',
            type: 'box',
            boundingBox: { x: 50, y: 220, width: 200, height: 100 },
            confidence: 0.93,
            label: 'BOX 2',
          },
          {
            id: 'box-3',
            type: 'box',
            boundingBox: { x: 50, y: 340, width: 200, height: 100 },
            confidence: 0.91,
            label: 'BOX 3',
          },
          {
            id: 'box-4',
            type: 'box',
            boundingBox: { x: 50, y: 460, width: 200, height: 100 },
            confidence: 0.89,
            label: 'BOX 4',
          },
        ];

        // Mock OCR result
        const medicineInfo = {
          name: 'Paracetamol',
          strength: '500mg',
          form: 'Tablet',
        };

        const batchInfo = {
          batchNumber: 'BT-24081',
          manufacturingDate: '01/2024',
          expiryDate: '12/2027',
          mrp: 42.5,
        };

        const packInfo = {
          unitsPerStrip: 10,
          stripsPerPackage: 10,
        };

        // Run calculation
        const quantityInfo = QuantityCalculator.calculate(mockItems, packInfo);

        const result: FrontendResultModel = {
          medicine: medicineInfo,
          batch: batchInfo,
          quantity: quantityInfo,
          confidence: {
            medicine: 0.94,
            quantity: 0.92,
          },
          items: mockItems,
        };

        resolve(result);
      }, 1500); // 1.5s simulated processing time
    });
  }
}
