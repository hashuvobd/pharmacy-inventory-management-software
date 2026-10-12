-- ==========================================
-- PHARMACY INVENTORY MANAGEMENT
-- DATABASE CLEANUP AND SETUP SCRIPT
-- ==========================================

-- STEP 1: DELETE UNNECESSARY TABLES IN THE PUBLIC SCHEMA
-- This block dynamically finds all tables in the 'public' schema and drops 
-- any table that is NOT in the allowed list of necessary tables.
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename NOT IN (
              'medicines', 
              'special_discounts', 
              'coupons', 
              'buyers', 
              'orders', 
              'order_items'
          )
    ) 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;


-- STEP 2: CREATE NECESSARY TABLES
-- 1. Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
  id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  brandId TEXT,
  unit_price NUMERIC,
  mrp NUMERIC,
  pack_mrp NUMERIC,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Special Discounts Table
CREATE TABLE IF NOT EXISTS special_discounts (
  id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buyers (Pharmacies/Clients) Table
CREATE TABLE IF NOT EXISTS buyers (
  id SERIAL PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  tier TEXT DEFAULT 'Standard Buyer',
  credit_limit NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending Verification',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, 
  buyer_id INTEGER REFERENCES buyers(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Processing',
  payment_status TEXT DEFAULT 'Unpaid',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id INTEGER REFERENCES medicines(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);

-- STEP 3: DISABLE ROW LEVEL SECURITY (RLS) FOR TESTING
ALTER TABLE medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE special_discounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE buyers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
