-- =========================================================================
-- RESTORE SUPER ADMIN ACCOUNT (admin@dgpharma.shop)
-- Run this in your Supabase SQL Editor to restore your Super Admin access.
-- =========================================================================

-- 1. Ensure required columns exist in admin_users
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS role_id TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Enable RLS and establish open access policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read admin_users" ON public.admin_users;
CREATE POLICY "Allow public read admin_users" ON public.admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert admin_users" ON public.admin_users;
CREATE POLICY "Allow public insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update admin_users" ON public.admin_users;
CREATE POLICY "Allow public update admin_users" ON public.admin_users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete admin_users" ON public.admin_users;
CREATE POLICY "Allow public delete admin_users" ON public.admin_users FOR DELETE USING (true);

-- 3. Delete any previous record with this email
DELETE FROM public.admin_users WHERE LOWER(TRIM(email)) = 'admin@dgpharma.shop';

-- 4. Insert the fresh Super Admin account
-- (Omits explicit id so Postgres serial/integer sequence assigns it automatically)
DO $$
BEGIN
  BEGIN
    INSERT INTO public.admin_users (
      name,
      email,
      phone,
      password,
      role_id,
      is_super_admin,
      status,
      created_at,
      updated_at
    )
    VALUES (
      'DG Pharma Super Admin',
      'admin@dgpharma.shop',
      '01700000000',
      '@dmin#dg.pharma#',
      'role-super-admin',
      true,
      'Active',
      NOW(),
      NOW()
    );
  EXCEPTION WHEN not_null_violation THEN
    -- Fallback in case id column has no default auto-increment sequence
    INSERT INTO public.admin_users (
      id,
      name,
      email,
      phone,
      password,
      role_id,
      is_super_admin,
      status,
      created_at,
      updated_at
    )
    VALUES (
      COALESCE((SELECT MAX(id) + 1 FROM public.admin_users), 1),
      'DG Pharma Super Admin',
      'admin@dgpharma.shop',
      '01700000000',
      '@dmin#dg.pharma#',
      'role-super-admin',
      true,
      'Active',
      NOW(),
      NOW()
    );
  END;
END $$;

-- 5. Verify creation
SELECT id, name, email, role_id, is_super_admin, status, updated_at 
FROM public.admin_users 
WHERE LOWER(TRIM(email)) = 'admin@dgpharma.shop';
