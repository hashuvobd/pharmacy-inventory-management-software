-- Step 1: Drop the old medicines table
DROP TABLE IF EXISTS medicines CASCADE;

-- Step 2: Create new medicines table matching the XLSX structure
CREATE TABLE medicines (
  id SERIAL PRIMARY KEY,
  company TEXT,
  product_name TEXT NOT NULL,
  dosage_form TEXT,
  generic TEXT,
  strength TEXT,
  pack_size TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  pack_mrp NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 100,
  moq INTEGER NOT NULL DEFAULT 1,
  is_deactivated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: RLS commands can be added here if needed, but RLS should be disabled for testing if you don't have policies.
-- ALTER TABLE medicines DISABLE ROW LEVEL SECURITY;
