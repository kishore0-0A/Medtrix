const { Client } = require('pg');

async function runMigration() {
  const connectionStrings = [
    'postgres://postgres:postgres@localhost:5432/postgres',
    'postgres://postgres:postgres@127.0.0.1:5432/postgres',
    'postgresql://postgres@localhost/postgres'
  ];

  const sql = `
    ALTER TABLE public.medicines 
      ADD COLUMN IF NOT EXISTS active_ingredient text,
      ADD COLUMN IF NOT EXISTS composition text,
      ADD COLUMN IF NOT EXISTS manufacturer_address text,
      ADD COLUMN IF NOT EXISTS manufacturing_license_number text,
      ADD COLUMN IF NOT EXISTS pack_size integer,
      ADD COLUMN IF NOT EXISTS pack_unit text,
      ADD COLUMN IF NOT EXISTS barcode text,
      ADD COLUMN IF NOT EXISTS gtin text,
      ADD COLUMN IF NOT EXISTS qr_code text,
      ADD COLUMN IF NOT EXISTS storage_instructions text,
      ADD COLUMN IF NOT EXISTS prescription_info text,
      ADD COLUMN IF NOT EXISTS warnings text,
      ADD COLUMN IF NOT EXISTS customer_care text,
      ADD COLUMN IF NOT EXISTS website text;

    ALTER TABLE public.medicine_batches
      ADD COLUMN IF NOT EXISTS lot_number text,
      ADD COLUMN IF NOT EXISTS currency text;
      
    NOTIFY pgrst, 'reload schema';
  `;

  for (const connectionString of connectionStrings) {
    console.log(`Trying to connect to ${connectionString}...`);
    const client = new Client({ connectionString });
    
    try {
      await client.connect();
      console.log('Connected successfully!');
      
      await client.query(sql);
      console.log('Migration executed successfully!');
      
      await client.end();
      return;
    } catch (e) {
      console.error(`Failed: ${e.message}`);
    }
  }
}

runMigration().catch(console.error);
