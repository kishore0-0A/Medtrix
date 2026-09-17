export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedItem {
  id: string;
  type: 'box' | 'strip' | 'tablet' | 'barcode' | 'text';
  boundingBox: BoundingBox;
  confidence: number;
  label: string;
}

export interface MedicineInfo {
  name: string;
  genericName?: string;
  strength?: string;
  form?: string;
  manufacturer?: string;
}

export interface BatchInfo {
  batchNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp?: number;
}

export interface QuantityInfo {
  packagesDetected: number;
  stripsDetected: number;
  unitsDetected: number;
  unitsPerStrip: number | null;
  stripsPerPackage: number | null;
  totalCalculated: number | null;
  isUnknown: boolean;
}

export interface ConfidenceInfo {
  medicine: number;
  quantity: number;
}

export interface FrontendResultModel {
  medicine: MedicineInfo;
  batch: BatchInfo;
  quantity: QuantityInfo;
  confidence: ConfidenceInfo;
  items: DetectedItem[]; // For visual bounding boxes
}
