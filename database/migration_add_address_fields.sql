-- ====================================================================
-- SUPABASE MIGRATION: ADD STRUCTURED ADDRESS FIELDS
-- ====================================================================
-- Run this script in your Supabase Project -> SQL Editor -> Run
-- This adds the 5 address fields (address_line1, address_line2, city,
-- division, postal_code) and related profile fields to your database.
-- ====================================================================

-- 1. UPDATE 'buyers' TABLE (Stores buyer / pharmacy profile data)
-- If the 'buyers' table exists, add new address and license columns:
ALTER TABLE IF EXISTS buyers 
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS division TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS pharmacy_id TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS trade_license TEXT,
  ADD COLUMN IF NOT EXISTS drug_license_file TEXT;

-- 2. UPDATE 'orders' TABLE (Stores historical invoice / order records)
-- Stores the snapshot of buyer address at the time the order was placed:
ALTER TABLE IF EXISTS orders 
  ADD COLUMN IF NOT EXISTS buyer_address TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS division TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. CREATE 'pharmacy_registrations' TABLE (Optional: for onboarding audit queue)
CREATE TABLE IF NOT EXISTS pharmacy_registrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT,
  trade_license TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  division TEXT,
  postal_code TEXT,
  location TEXT,
  drug_license_file TEXT,
  attachment_status TEXT DEFAULT 'Uploaded (Unverified)',
  status TEXT DEFAULT 'Pending',
  apply_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DISABLE RLS (for smooth development / demo testing)
ALTER TABLE IF EXISTS buyers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pharmacy_registrations DISABLE ROW LEVEL SECURITY;
