create extension if not exists pgcrypto;

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text not null unique,
  generic_name text,
  active_ingredient text,
  composition text,
  strength text,
  form text,
  manufacturer text,
  manufacturer_address text,
  manufacturing_license_number text,
  barcode text,
  gtin text,
  qr_code text,
  storage_instructions text,
  prescription_info text,
  warnings text,
  customer_care text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medicine_batches (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  batch_number text not null,
  lot_number text,
  manufacturing_date text,
  expiry_date text,
  mrp numeric(10, 2),
  currency text,
  pack_size numeric,
  pack_unit text,
  quantity integer not null default 0 check (quantity >= 0),
  units_per_strip integer,
  strips_per_package integer,
  scan_image_uri text,
  raw_ocr_text text,
  confidence_medicine numeric(4, 3),
  confidence_quantity numeric(4, 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  medicine_batch_id uuid not null references public.medicine_batches(id) on delete cascade,
  transaction_type text not null,
  quantity_delta integer not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists medicine_batches_medicine_id_idx
  on public.medicine_batches(medicine_id);

create index if not exists medicine_batches_created_at_idx
  on public.medicine_batches(created_at desc);

alter table public.medicines enable row level security;
alter table public.medicine_batches enable row level security;
alter table public.inventory_transactions enable row level security;

drop policy if exists "Authenticated users can read medicines" on public.medicines;
drop policy if exists "Authenticated users can write medicines" on public.medicines;
drop policy if exists "Authenticated users can read medicine batches" on public.medicine_batches;
drop policy if exists "Authenticated users can write medicine batches" on public.medicine_batches;
drop policy if exists "Authenticated users can read inventory transactions" on public.inventory_transactions;
drop policy if exists "Authenticated users can write inventory transactions" on public.inventory_transactions;

create policy "Authenticated users can read medicines"
  on public.medicines
  for select
  to authenticated
  using (true);

create policy "Authenticated users can write medicines"
  on public.medicines
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can read medicine batches"
  on public.medicine_batches
  for select
  to authenticated
  using (true);

create policy "Authenticated users can write medicine batches"
  on public.medicine_batches
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can read inventory transactions"
  on public.inventory_transactions
  for select
  to authenticated
  using (true);

create policy "Authenticated users can write inventory transactions"
  on public.inventory_transactions
  for all
  to authenticated
  using (true)
  with check (true);
