-- Step 1: Create the special_discounts table
CREATE TABLE IF NOT EXISTS special_discounts (
  id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create the coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: RLS can be added here if needed, but keeping it simple for testing.
-- ALTER TABLE special_discounts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
