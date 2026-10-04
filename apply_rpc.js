const { Client } = require('pg');

async function runMigration() {
  const connectionStrings = [
    'postgres://postgres:postgres@localhost:5432/postgres',
    'postgres://postgres:postgres@127.0.0.1:5432/postgres',
    'postgresql://postgres@localhost/postgres'
  ];

  const sql = `
CREATE OR REPLACE FUNCTION process_stock_out_rpc(
    p_batch_id uuid,
    p_issue_quantity integer,
    p_notes text DEFAULT 'Issued through Smart Medicine Scanner'
) RETURNS json AS $$
DECLARE
    v_current_quantity integer;
    v_expiry_date text;
    v_new_quantity integer;
BEGIN
    -- 1. Lock the row to prevent concurrent updates
    SELECT quantity, expiry_date INTO v_current_quantity, v_expiry_date
    FROM public.medicine_batches
    WHERE id = p_batch_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Batch not found.';
    END IF;

    IF p_issue_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be greater than zero.';
    END IF;

    -- 2. Validate quantity
    IF v_current_quantity < p_issue_quantity THEN
        RAISE EXCEPTION 'Insufficient stock. Only % units available.', v_current_quantity;
    END IF;

    -- 3. Update batch
    v_new_quantity := v_current_quantity - p_issue_quantity;

    UPDATE public.medicine_batches
    SET quantity = v_new_quantity,
        updated_at = now()
    WHERE id = p_batch_id;

    -- 4. Create transaction log
    INSERT INTO public.inventory_transactions (
        medicine_batch_id,
        transaction_type,
        quantity,
        notes
    ) VALUES (
        p_batch_id,
        'STOCK_OUT',
        p_issue_quantity,
        p_notes
    );

    RETURN json_build_object(
        'success', true,
        'new_quantity', v_new_quantity
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  for (const connectionString of connectionStrings) {
    console.log(`Trying to connect to ${connectionString}...`);
    const client = new Client({ connectionString });
    
    try {
      await client.connect();
      console.log('Connected successfully!');
      
      await client.query(sql);
      console.log('RPC created successfully!');
      
      await client.end();
      return;
    } catch (e) {
      console.error(`Failed: ${e.message}`);
    }
  }
}

runMigration().catch(console.error);
