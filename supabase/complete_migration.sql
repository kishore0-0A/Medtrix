-- ====================================================================
-- Complete Medtrix Schema Migration
-- Ensures all columns required by the mobile application exist
-- across medicines, medicine_batches, and inventory_transactions.
-- ====================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Ensure medicines table has all required columns and constraints
ALTER TABLE public.medicines 
  ADD COLUMN IF NOT EXISTS name_key text,
  ADD COLUMN IF NOT EXISTS generic_name text,
  ADD COLUMN IF NOT EXISTS active_ingredient text,
  ADD COLUMN IF NOT EXISTS composition text,
  ADD COLUMN IF NOT EXISTS strength text,
  ADD COLUMN IF NOT EXISTS form text,
  ADD COLUMN IF NOT EXISTS manufacturer text,
  ADD COLUMN IF NOT EXISTS manufacturer_address text,
  ADD COLUMN IF NOT EXISTS manufacturing_license_number text,
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS gtin text,
  ADD COLUMN IF NOT EXISTS qr_code text,
  ADD COLUMN IF NOT EXISTS storage_instructions text,
  ADD COLUMN IF NOT EXISTS prescription_info text,
  ADD COLUMN IF NOT EXISTS warnings text,
  ADD COLUMN IF NOT EXISTS customer_care text,
  ADD COLUMN IF NOT EXISTS website text;

-- Populate name_key for any existing rows where it might be NULL
UPDATE public.medicines 
SET name_key = lower(trim(name)) || '|' || lower(trim(coalesce(strength, '')))
WHERE name_key IS NULL;

-- Ensure UNIQUE constraint on name_key for upsert support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medicines_name_key_key'
  ) THEN
    ALTER TABLE public.medicines ADD CONSTRAINT medicines_name_key_key UNIQUE (name_key);
  END IF;
END $$;

-- 3. Ensure medicine_batches table has all required columns
ALTER TABLE public.medicine_batches
  ADD COLUMN IF NOT EXISTS lot_number text,
  ADD COLUMN IF NOT EXISTS manufacturing_date text,
  ADD COLUMN IF NOT EXISTS expiry_date text,
  ADD COLUMN IF NOT EXISTS mrp numeric(10, 2),
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS pack_size numeric,
  ADD COLUMN IF NOT EXISTS pack_unit text,
  ADD COLUMN IF NOT EXISTS units_per_strip integer,
  ADD COLUMN IF NOT EXISTS strips_per_package integer,
  ADD COLUMN IF NOT EXISTS scan_image_uri text,
  ADD COLUMN IF NOT EXISTS raw_ocr_text text,
  ADD COLUMN IF NOT EXISTS confidence_medicine numeric(4, 3),
  ADD COLUMN IF NOT EXISTS confidence_quantity numeric(4, 3);

-- 4. Ensure inventory_transactions table has all required columns
ALTER TABLE public.inventory_transactions
  ADD COLUMN IF NOT EXISTS quantity_delta integer,
  ADD COLUMN IF NOT EXISTS notes text;

-- 5. Force PostgREST to reload its schema cache immediately
NOTIFY pgrst, 'reload schema';
