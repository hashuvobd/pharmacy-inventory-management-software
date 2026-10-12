-- =========================================================================
-- MIGRATION: Role-Based Access Control (RBAC), Staff Users & Activity Logs
-- =========================================================================

-- 1. CREATE admin_roles TABLE
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admin_roles" ON public.admin_roles;
CREATE POLICY "Allow public read admin_roles" ON public.admin_roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert admin_roles" ON public.admin_roles;
CREATE POLICY "Allow public insert admin_roles" ON public.admin_roles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update admin_roles" ON public.admin_roles;
CREATE POLICY "Allow public update admin_roles" ON public.admin_roles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete admin_roles" ON public.admin_roles;
CREATE POLICY "Allow public delete admin_roles" ON public.admin_roles FOR DELETE USING (true);


-- 2. ENHANCE admin_users TABLE
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS role_id TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admin_users" ON public.admin_users;
CREATE POLICY "Allow public read admin_users" ON public.admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert admin_users" ON public.admin_users;
CREATE POLICY "Allow public insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update admin_users" ON public.admin_users;
CREATE POLICY "Allow public update admin_users" ON public.admin_users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete admin_users" ON public.admin_users;
CREATE POLICY "Allow public delete admin_users" ON public.admin_users FOR DELETE USING (true);

UPDATE public.admin_users SET is_super_admin = true, status = 'Active' WHERE email = 'admin@dgpharma.shop' OR email = 'admin@dgpharma.com';


-- 3. CREATE admin_activity_logs TABLE
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  role_name TEXT,
  actor_name TEXT,
  actor_email TEXT,
  actor_role TEXT,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  target_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure backwards compatibility if the table already existed without these columns
ALTER TABLE public.admin_activity_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.admin_activity_logs ADD COLUMN IF NOT EXISTS actor_name TEXT;
ALTER TABLE public.admin_activity_logs ADD COLUMN IF NOT EXISTS actor_email TEXT;
ALTER TABLE public.admin_activity_logs ADD COLUMN IF NOT EXISTS actor_role TEXT;
ALTER TABLE public.admin_activity_logs ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.admin_activity_logs ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.admin_activity_logs ADD COLUMN IF NOT EXISTS role_name TEXT;
ALTER TABLE public.admin_activity_logs ALTER COLUMN user_name DROP NOT NULL;
ALTER TABLE public.admin_activity_logs ALTER COLUMN user_email DROP NOT NULL;

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admin_activity_logs" ON public.admin_activity_logs;
CREATE POLICY "Allow public read admin_activity_logs" ON public.admin_activity_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert admin_activity_logs" ON public.admin_activity_logs;
CREATE POLICY "Allow public insert admin_activity_logs" ON public.admin_activity_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete admin_activity_logs" ON public.admin_activity_logs;
CREATE POLICY "Allow public delete admin_activity_logs" ON public.admin_activity_logs FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON public.admin_activity_logs(category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON public.admin_activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);


-- 4. SEED default system roles
INSERT INTO public.admin_roles (id, name, description, permissions, is_system)
VALUES
  (
    'role-super-admin',
    'Super Administrator',
    'Unrestricted master access across the entire pharmacy management system.',
    ARRAY[
      'approvals.view', 'approvals.action', 'approvals.delete',
      'orders.view', 'orders.status', 'orders.edit', 'orders.returns',
      'requests.view', 'requests.action',
      'inventory.view', 'inventory.stock', 'inventory.pricing', 'inventory.moq', 'inventory.manage', 'inventory.bulk_rules',
      'stockout.view', 'stockout.restock',
      'deliveryzones.view', 'deliveryzones.manage',
      'discounts.manage', 'coupons.manage',
      'barcode.scan', 'analytics.view', 'backup.manage',
      'roles.manage', 'users.manage', 'activity_log.view'
    ],
    true
  ),
  (
    'role-order-manager',
    'Order & Delivery Dispatcher',
    'Manages order verification, packing, returns, and delivery personnel assignments.',
    ARRAY[
      'orders.view', 'orders.status', 'orders.edit', 'orders.returns',
      'deliveryzones.view', 'deliveryzones.manage',
      'barcode.scan', 'activity_log.view'
    ],
    false
  ),
  (
    'role-inventory-manager',
    'Inventory & Pricing Manager',
    'Manages medicine stock, trade prices, pack MRPs, MOQs, and promotional discounts.',
    ARRAY[
      'inventory.view', 'inventory.stock', 'inventory.pricing', 'inventory.moq', 'inventory.manage', 'inventory.bulk_rules',
      'stockout.view', 'stockout.restock',
      'discounts.manage', 'requests.view', 'requests.action',
      'activity_log.view'
    ],
    false
  ),
  (
    'role-compliance-agent',
    'Compliance & Onboarding Agent',
    'Verifies buyer drug licenses, approves registrations, and reviews medicine requests.',
    ARRAY[
      'approvals.view', 'approvals.action',
      'requests.view', 'requests.action',
      'activity_log.view'
    ],
    false
  )
ON CONFLICT (id) DO NOTHING;
