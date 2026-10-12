-- ==========================================
-- PHARMACY INVENTORY MANAGEMENT - DATABASE SCHEMA
-- ==========================================

-- 1. Medicines Table (You likely already have this from the CSV imports, but here is the reference schema)
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
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  division TEXT,
  postal_code TEXT,
  address TEXT,
  pharmacy_id TEXT,
  owner_name TEXT,
  license_number TEXT,
  trade_license TEXT,
  drug_license_file TEXT,
  tier TEXT DEFAULT 'Standard Buyer',
  credit_limit NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending Verification',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, -- e.g., 'PB-2026-8842'
  buyer_id INTEGER REFERENCES buyers(id) ON DELETE SET NULL,
  buyer_name TEXT,
  buyer_address TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  division TEXT,
  postal_code TEXT,
  phone TEXT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Processing',
  payment_status TEXT DEFAULT 'Unpaid',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items Table (Links orders to medicines)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  medicine_id INTEGER REFERENCES medicines(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL
);

-- Disable Row Level Security (RLS) for testing purposes
-- Note: You should enable and configure RLS policies before going to production
ALTER TABLE special_discounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE buyers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
