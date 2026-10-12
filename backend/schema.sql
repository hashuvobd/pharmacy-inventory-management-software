-- PharmaBridge Inventory Management Software - Full Supabase PostgreSQL Schema

-- 1. Create Buyers (Pharmacies) Table
CREATE TABLE IF NOT EXISTS buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    license_number TEXT,
    contact_person TEXT,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    address TEXT,
    status TEXT DEFAULT 'pending_approval', -- 'pending_approval', 'approved', 'rejected'
    credit_limit NUMERIC(15, 2) DEFAULT 50000.00,
    outstanding_balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Medicines Table (Your existing table, but structured for Postgres)
CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    brand_id TEXT UNIQUE,
    brand_name TEXT NOT NULL, -- (Medicine Name)
    type TEXT,
    dosage_form TEXT,
    generic TEXT,
    strength TEXT,
    manufacturer TEXT,
    pack_size TEXT,
    stock INT NOT NULL DEFAULT 0,
    moq INT NOT NULL DEFAULT 1,
    wholesale_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- Custom ID like 'PB-2026-9481'
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15, 2) DEFAULT 0.00,
    subtotal NUMERIC(15, 2) DEFAULT 0.00,
    payment_method TEXT DEFAULT 'credit', -- 'credit', 'bank', 'cod'
    payment_status TEXT DEFAULT 'Unpaid', -- 'Paid', 'Unpaid'
    fulfillment_status TEXT DEFAULT 'Pending Verification', -- 'Pending Verification', 'Dispatched', 'Completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Order Items (Cart Items) Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    item_total NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Ledger (Transactions) Table to track credit and payments
CREATE TABLE IF NOT EXISTS ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL, -- Null if transaction is a direct bank payment
    type TEXT NOT NULL, -- 'Invoice' (reduces credit limit), 'Payment' (increases credit limit), 'Refund'
    amount NUMERIC(15, 2) NOT NULL,
    debit NUMERIC(15, 2) DEFAULT 0.00,
    credit NUMERIC(15, 2) DEFAULT 0.00,
    balance_after NUMERIC(15, 2) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Enable Row Level Security (RLS) on these tables for production
-- ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ledger_transactions ENABLE ROW LEVEL SECURITY;
