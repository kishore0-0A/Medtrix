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
  genericName?: string | null;
  activeIngredient?: string | null;
  composition?: string | null;
  strength?: string | null;
  form?: string | null;
  manufacturer?: string | null;
  manufacturerAddress?: string | null;
  manufacturingLicenseNumber?: string | null;
}

export interface BatchInfo {
  batchNumber?: string | null;
  lotNumber?: string | null;
  manufacturingDate?: string | null;
  expiryDate?: string | null;
  mrp?: number | null;
  currency?: string | null;
}

export interface PackInfo {
  packSize?: number | null;
  packUnit?: string | null;
}

export interface IdentificationInfo {
  barcode?: string | null;
  gtin?: string | null;
  qrCode?: string | null;
}

export interface SafetyInfo {
  storageInstructions?: string | null;
  prescriptionInfo?: string | null;
  warnings?: string | null;
}

export interface ContactInfo {
  customerCare?: string | null;
  website?: string | null;
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
  pack: PackInfo;
  identification: IdentificationInfo;
  safety: SafetyInfo;
  contact: ContactInfo;
  quantity: QuantityInfo;
  confidence: ConfidenceInfo;
  items: DetectedItem[];
  capturedImageUri?: string | null;
  rawOcrText?: string | null;
}
