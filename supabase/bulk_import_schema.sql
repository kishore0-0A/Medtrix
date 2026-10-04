-- Bulk Stock Import Schema
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  contact_number text,
  email text,
  tax_registration_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_invoices (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  invoice_number text not null,
  invoice_date text,
  subtotal numeric(10, 2),
  tax numeric(10, 2),
  discount numeric(10, 2),
  grand_total numeric(10, 2),
  file_reference text,
  import_status text,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.purchase_invoices(id) on delete cascade,
  medicine_id uuid references public.medicines(id) on delete set null,
  batch_id uuid references public.medicine_batches(id) on delete set null,
  quantity integer not null default 0,
  free_quantity integer default 0,
  unit text,
  purchase_rate numeric(10, 2),
  tax_percentage numeric(5, 2),
  line_total numeric(10, 2),
  created_at timestamptz not null default now()
);

create table if not exists public.import_history (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  import_status text,
  total_items_detected integer default 0,
  items_imported integer default 0,
  items_failed integer default 0,
  error_details text,
  user_id text,
  created_at timestamptz not null default now()
);

-- Add RLS Policies
alter table public.suppliers enable row level security;
alter table public.purchase_invoices enable row level security;
alter table public.purchase_invoice_items enable row level security;
alter table public.import_history enable row level security;

create policy "Authenticated users can read suppliers" on public.suppliers for select to authenticated using (true);
create policy "Authenticated users can write suppliers" on public.suppliers for all to authenticated using (true) with check (true);

create policy "Authenticated users can read invoices" on public.purchase_invoices for select to authenticated using (true);
create policy "Authenticated users can write invoices" on public.purchase_invoices for all to authenticated using (true) with check (true);

create policy "Authenticated users can read invoice items" on public.purchase_invoice_items for select to authenticated using (true);
create policy "Authenticated users can write invoice items" on public.purchase_invoice_items for all to authenticated using (true) with check (true);

create policy "Authenticated users can read import history" on public.import_history for select to authenticated using (true);
create policy "Authenticated users can write import history" on public.import_history for all to authenticated using (true) with check (true);
