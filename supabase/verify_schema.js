const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  'https://ewtnbgolxjzgkvmofdfi.supabase.co',
  'sb_publishable_7GyoHRyRinlHFuw9CLNiOg_Vh9RU21C'
);

const checks = {
  medicines: [
    'id', 'name', 'name_key', 'generic_name', 'active_ingredient', 'composition',
    'strength', 'form', 'manufacturer', 'manufacturer_address', 'manufacturing_license_number',
    'barcode', 'gtin', 'qr_code', 'storage_instructions', 'prescription_info',
    'warnings', 'customer_care', 'website', 'created_at', 'updated_at'
  ],
  medicine_batches: [
    'id', 'medicine_id', 'batch_number', 'lot_number', 'manufacturing_date',
    'expiry_date', 'mrp', 'currency', 'pack_size', 'pack_unit', 'quantity',
    'units_per_strip', 'strips_per_package', 'scan_image_uri', 'raw_ocr_text',
    'confidence_medicine', 'confidence_quantity', 'created_at', 'updated_at'
  ],
  inventory_transactions: [
    'id', 'medicine_batch_id', 'transaction_type', 'quantity_delta', 'notes', 'created_at'
  ]
};

async function verify() {
  let allGood = true;
  for (const [table, cols] of Object.entries(checks)) {
    const missing = [];
    for (const c of cols) {
      const { error } = await client.from(table).select(c).limit(0);
      if (error) {
        missing.push(c);
      }
    }
    if (missing.length > 0) {
      allGood = false;
      console.log(`[!] Table '${table}' is MISSING columns:`, missing);
    } else {
      console.log(`[OK] Table '${table}' has all required columns.`);
    }
  }

  if (allGood) {
    console.log('\n SUCCESS: Schema is 100% complete and synchronized with the mobile app!');
  } else {
    console.log('\n PENDING: Please execute supabase/complete_migration.sql in the Supabase SQL editor.');
  }
}

verify();
