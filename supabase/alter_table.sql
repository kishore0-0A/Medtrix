-- Minimum required migration to support OCR extraction fields
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
