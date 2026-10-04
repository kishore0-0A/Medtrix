import { FrontendResultModel } from '../services/cv/models';
import { supabase } from './client';

// ============================================================
// TYPES
// ============================================================

export interface MedicineRow {
  id: string;
  name: string;
  name_key?: string | null;
  generic_name?: string | null;
  active_ingredient?: string | null;
  composition?: string | null;
  strength?: string | null;
  form?: string | null;
  dosage_form?: string | null;
  manufacturer?: string | null;
  manufacturer_address?: string | null;
  manufacturing_license_number?: string | null;
  barcode?: string | null;
  gtin?: string | null;
  qr_code?: string | null;
  storage_instructions?: string | null;
  prescription_info?: string | null;
  warnings?: string | null;
  customer_care?: string | null;
  website?: string | null;
}

export interface BatchRow {
  id: string;
  medicine_id: string;
  batch_number: string;
  lot_number?: string | null;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  mrp?: number | null;
  currency?: string | null;
  pack_size?: number | null;
  pack_unit?: string | null;
  quantity?: number | null;
  units_per_strip?: number | null;
  strips_per_package?: number | null;
  scan_image_uri?: string | null;
  raw_ocr_text?: string | null;
  confidence_medicine?: number | null;
  confidence_quantity?: number | null;
}

export type InventoryStatus = 'healthy' | 'low' | 'expiring' | 'critical';

export interface InventoryItem {
  id: string;
  medicineId: string;
  name: string;
  genericName: string | null;
  activeIngredient: string | null;
  composition: string | null;
  strength: string | null;
  form: string | null;
  manufacturer: string | null;
  manufacturerAddress: string | null;
  manufacturingLicenseNumber: string | null;
  barcode: string | null;
  gtin: string | null;
  qrCode: string | null;
  storageInstructions: string | null;
  prescriptionInfo: string | null;
  warnings: string | null;
  customerCare: string | null;
  website: string | null;
  batchNumber: string;
  lotNumber: string | null;
  manufacturingDate: string | null;
  expiryDate: string | null;
  mrp: number | null;
  currency: string | null;
  packSize: number | null;
  packUnit: string | null;
  quantity: number;
  unitsPerStrip: number | null;
  stripsPerPackage: number | null;
  scanImageUri: string | null;
  rawOcrText: string | null;
  confidenceMedicine: number | null;
  confidenceQuantity: number | null;
  status: InventoryStatus;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Creates a normalized key for identifying the same medicine.
 *
 * Example:
 * "Paracetamol" + "500 mg"
 * becomes:
 * "paracetamol|500 mg"
 */
const normalizeNameKey = (
  name: string,
  strength?: string | null
): string => {
  return `${name.trim().toLowerCase()}|${(strength ?? '')
    .trim()
    .toLowerCase()}`;
};

/**
 * Converts different date formats into a PostgreSQL-compatible
 * date string.
 *
 * Supported:
 * YYYY-MM-DD
 * DD/MM/YYYY
 * DD-MM-YYYY
 * MM/YYYY
 * MM-YYYY
 */
const normalizeDateForDb = (
  value?: string | null,
  isExpiry = false
): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  // ----------------------------------------------------------
  // Already YYYY-MM-DD
  // ----------------------------------------------------------

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // ----------------------------------------------------------
  // DD/MM/YYYY or DD-MM-YYYY
  // ----------------------------------------------------------

  const dmy = trimmed.match(
    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/
  );

  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10);
    let year = parseInt(dmy[3], 10);

    if (year < 100) {
      year += 2000;
    }

    if (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      return `${year.toString().padStart(4, '0')}-${month
        .toString()
        .padStart(2, '0')}-${day
        .toString()
        .padStart(2, '0')}`;
    }
  }

  // ----------------------------------------------------------
  // MM/YYYY or MM-YYYY
  // ----------------------------------------------------------

  const my = trimmed.match(
    /^(\d{1,2})[\/-](\d{2,4})$/
  );

  if (my) {
    const month = parseInt(my[1], 10);
    let year = parseInt(my[2], 10);

    if (year < 100) {
      year += 2000;
    }

    if (month >= 1 && month <= 12) {
      // Expiry month/year:
      // use the LAST day of that month.
      //
      // Example:
      // 08/2028 → 2028-08-31
      if (isExpiry) {
        const lastDay = new Date(
          year,
          month,
          0
        ).getDate();

        return `${year.toString().padStart(4, '0')}-${month
          .toString()
          .padStart(2, '0')}-${lastDay
          .toString()
          .padStart(2, '0')}`;
      }

      // Manufacturing month/year:
      // use the FIRST day of that month.
      //
      // Example:
      // 02/2026 → 2026-02-01
      return `${year.toString().padStart(4, '0')}-${month
        .toString()
        .padStart(2, '0')}-01`;
    }
  }

  return null;
};

/**
 * Gets the quantity that should be added to inventory.
 *
 * Priority:
 * 1. User-confirmed totalCalculated quantity
 * 2. OCR-detected units
 * 3. 0
 */
const toBatchQuantity = (
  result: FrontendResultModel
): number => {
  return (
    result.quantity.totalCalculated ??
    result.quantity.unitsDetected ??
    0
  );
};

// ============================================================
// CONVERT DATABASE ROW → INVENTORY ITEM
// ============================================================

function toInventoryItem(
  row: BatchRow & {
    medicines?: MedicineRow | null;
  }
): InventoryItem {
  const medicine = row.medicines;

  let status: InventoryStatus = 'healthy';
  const qty = row.quantity ?? 0;
  
  if (qty === 0) {
    status = 'critical';
  } else if (qty < 20) {
    status = 'low';
  }

  if (row.expiry_date) {
    const expiry = new Date(row.expiry_date);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      status = 'critical';
    } else if (diffDays <= 90 && status !== 'critical') {
      status = 'expiring';
    }
  }

  return {
    id: row.id,

    medicineId: row.medicine_id,

    name: medicine?.name ?? '',

    genericName:
      medicine?.generic_name ?? null,

    activeIngredient:
      medicine?.active_ingredient ?? null,

    composition:
      medicine?.composition ?? null,

    strength:
      medicine?.strength ?? null,

    form:
      medicine?.form ??
      medicine?.dosage_form ??
      null,

    manufacturer:
      medicine?.manufacturer ?? null,

    manufacturerAddress:
      medicine?.manufacturer_address ?? null,

    manufacturingLicenseNumber:
      medicine?.manufacturing_license_number ?? null,

    barcode:
      medicine?.barcode ?? null,

    gtin:
      medicine?.gtin ?? null,

    qrCode:
      medicine?.qr_code ?? null,

    storageInstructions:
      medicine?.storage_instructions ?? null,

    prescriptionInfo:
      medicine?.prescription_info ?? null,

    warnings:
      medicine?.warnings ?? null,

    customerCare:
      medicine?.customer_care ?? null,

    website:
      medicine?.website ?? null,

    batchNumber:
      row.batch_number,

    lotNumber:
      row.lot_number ?? null,

    manufacturingDate:
      row.manufacturing_date ?? null,

    expiryDate:
      row.expiry_date ?? null,

    mrp:
      row.mrp ?? null,

    currency:
      row.currency ?? null,

    packSize:
      row.pack_size ?? null,

    packUnit:
      row.pack_unit ?? null,

    quantity:
      row.quantity ?? 0,

    unitsPerStrip:
      row.units_per_strip ?? null,

    stripsPerPackage:
      row.strips_per_package ?? null,

    scanImageUri:
      row.scan_image_uri ?? null,

    rawOcrText:
      row.raw_ocr_text ?? null,

    confidenceMedicine:
      row.confidence_medicine ?? null,

    confidenceQuantity:
      row.confidence_quantity ?? null,

    status,
  };
}

// ============================================================
// DATABASE SERVICE
// ============================================================

export const Database = {

  // ==========================================================
  // GET INVENTORY
  // ==========================================================

  async getInventory() {
    try {
      const response = await supabase
        .from('medicine_batches')
        .select(`
          *,
          medicines (*)
        `)
        .order('created_at', {
          ascending: false,
        });

      if (response.error) {
        console.error(
          'Get inventory error:',
          response.error
        );

        return {
          data: null,
          error: response.error,
        };
      }

      const inventory = (response.data ?? []).map(
        (row) =>
          toInventoryItem(
            row as BatchRow & {
              medicines?: MedicineRow | null;
            }
          )
      );

      return {
        data: inventory,
        error: null,
      };
    } catch (error) {
      console.error(
        'Unexpected getInventory error:',
        error
      );

      return {
        data: null,
        error,
      };
    }
  },

  // ==========================================================
  // SAVE SCANNED MEDICINE
  // ==========================================================

  async saveScannedMedicine(
    result: FrontendResultModel
  ) {
    try {

      // --------------------------------------------------------
      // 1. MEDICINE PAYLOAD
      // --------------------------------------------------------

      const medicinePayload = {
        name: result.medicine.name,

        name_key: normalizeNameKey(
          result.medicine.name,
          result.medicine.strength
        ),

        generic_name:
          result.medicine.genericName ?? null,

        active_ingredient:
          result.medicine.activeIngredient ?? null,

        composition:
          result.medicine.composition ?? null,

        strength:
          result.medicine.strength ?? null,

        form:
          result.medicine.form ?? null,

        manufacturer:
          result.medicine.manufacturer ?? null,

        manufacturer_address:
          result.medicine.manufacturerAddress ?? null,

        manufacturing_license_number:
          result.medicine.manufacturingLicenseNumber ?? null,

        barcode:
          result.identification.barcode ?? null,

        gtin:
          result.identification.gtin ?? null,

        qr_code:
          result.identification.qrCode ?? null,

        storage_instructions:
          result.safety.storageInstructions ?? null,

        prescription_info:
          result.safety.prescriptionInfo ?? null,

        warnings:
          result.safety.warnings ?? null,

        customer_care:
          result.contact.customerCare ?? null,

        website:
          result.contact.website ?? null,
      };

      // --------------------------------------------------------
      // 2. INSERT / UPDATE MEDICINE
      // --------------------------------------------------------

      const medicineResponse = await supabase
        .from('medicines')
        .upsert(
          medicinePayload,
          {
            onConflict: 'name_key',
          }
        )
        .select()
        .single();

      if (medicineResponse.error) {
        console.error(
          'Medicine save error:',
          medicineResponse.error
        );

        return {
          data: null,
          error: medicineResponse.error,
        };
      }

      const medicine =
        medicineResponse.data as MedicineRow;

      // --------------------------------------------------------
      // 3. GET BATCH NUMBER
      // --------------------------------------------------------

      const batchNumber =
        result.batch.batchNumber?.trim() ||
        `SCAN-${Date.now()}`;

      // --------------------------------------------------------
      // 4. GET USER-CONFIRMED QUANTITY
      // --------------------------------------------------------

      const addedQuantity =
        toBatchQuantity(result);

      console.log(
        'Saving inventory quantity:',
        addedQuantity
      );

      if (addedQuantity <= 0) {
        return {
          data: null,
          error: new Error(
            'Inventory quantity must be greater than zero.'
          ),
        };
      }

      // --------------------------------------------------------
      // 5. CHECK IF BATCH ALREADY EXISTS
      // --------------------------------------------------------

      const existingBatchResponse =
        await supabase
          .from('medicine_batches')
          .select('*')
          .eq(
            'medicine_id',
            medicine.id
          )
          .eq(
            'batch_number',
            batchNumber
          )
          .maybeSingle();

      if (existingBatchResponse.error) {
        console.error(
          'Batch lookup error:',
          existingBatchResponse.error
        );

        return {
          data: null,
          error: existingBatchResponse.error,
        };
      }

      // --------------------------------------------------------
      // 6. UPDATE EXISTING BATCH
      // --------------------------------------------------------

      let batch: BatchRow;

      if (existingBatchResponse.data) {

        const existingBatch =
          existingBatchResponse.data as BatchRow;

        const newQuantity =
          (existingBatch.quantity ?? 0) +
          addedQuantity;

        const updateResponse =
          await supabase
            .from('medicine_batches')
            .update({
              quantity: newQuantity,
            })
            .eq(
              'id',
              existingBatch.id
            )
            .select()
            .single();

        if (updateResponse.error) {
          console.error(
            'Batch update error:',
            updateResponse.error
          );

          return {
            data: null,
            error: updateResponse.error,
          };
        }

        batch =
          updateResponse.data as BatchRow;

      } else {

        // ------------------------------------------------------
        // 7. CREATE NEW BATCH
        // ------------------------------------------------------

        const batchPayload = {

          medicine_id:
            medicine.id,

          batch_number:
            batchNumber,

          lot_number:
            result.batch.lotNumber ?? null,

          manufacturing_date:
            normalizeDateForDb(
              result.batch.manufacturingDate,
              false
            ),

          expiry_date:
            normalizeDateForDb(
              result.batch.expiryDate,
              true
            ),

          mrp:
            result.batch.mrp ?? null,

          currency:
            result.batch.currency ?? null,

          pack_size:
            result.pack.packSize ?? null,

          pack_unit:
            result.pack.packUnit ?? null,

          quantity:
            addedQuantity,

          units_per_strip:
            result.quantity.unitsPerStrip ?? null,

          strips_per_package:
            result.quantity.stripsPerPackage ?? null,

          scan_image_uri:
            result.capturedImageUri ?? null,

          raw_ocr_text:
            result.rawOcrText ?? null,

          confidence_medicine:
            result.confidence.medicine ?? null,

          confidence_quantity:
            result.confidence.quantity ?? null,
        };

        const batchResponse =
          await supabase
            .from('medicine_batches')
            .insert(batchPayload)
            .select()
            .single();

        if (batchResponse.error) {
          console.error(
            'Batch insert error:',
            batchResponse.error
          );

          return {
            data: null,
            error: batchResponse.error,
          };
        }

        batch =
          batchResponse.data as BatchRow;
      }

      // --------------------------------------------------------
      // 8. CREATE INVENTORY TRANSACTION
      // --------------------------------------------------------
      //
      // The current database requires:
      //
      // quantity NOT NULL
      //
      // Therefore we explicitly insert quantity.
      //
      // We intentionally do NOT send quantity_delta because
      // the currently verified schema does not confirm that
      // column exists.
      // --------------------------------------------------------

      const transactionResponse =
        await supabase
          .from('inventory_transactions')
          .insert({
            medicine_batch_id:
              batch.id,

            transaction_type:
              'received',

            quantity:
              addedQuantity,

            notes:
              'Added through Smart Medicine Scanner',
          });

      if (transactionResponse.error) {

        console.error(
          'Inventory transaction error:',
          transactionResponse.error
        );

        return {
          data: null,
          error: transactionResponse.error,
        };
      }

      // --------------------------------------------------------
      // 9. RETURN SAVED INVENTORY ITEM
      // --------------------------------------------------------

      return {
        data: toInventoryItem({
          ...batch,
          medicines: medicine,
        }),

        error: null,
      };

    } catch (error) {

      console.error(
        'Unexpected saveScannedMedicine error:',
        error
      );

      return {
        data: null,
        error,
      };
    }
  },
};