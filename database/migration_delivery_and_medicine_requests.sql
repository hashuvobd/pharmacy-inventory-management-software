-- =========================================================================
-- MIGRATION: Delivery Men & Medicine Requests Sync
-- =========================================================================

-- 1. CREATE delivery_men TABLE
CREATE TABLE IF NOT EXISTS public.delivery_men (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  zones TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.delivery_men ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read delivery_men" ON public.delivery_men;
CREATE POLICY "Allow public read delivery_men" ON public.delivery_men FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert delivery_men" ON public.delivery_men;
CREATE POLICY "Allow public insert delivery_men" ON public.delivery_men FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update delivery_men" ON public.delivery_men;
CREATE POLICY "Allow public update delivery_men" ON public.delivery_men FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete delivery_men" ON public.delivery_men;
CREATE POLICY "Allow public delete delivery_men" ON public.delivery_men FOR DELETE USING (true);


-- 2. CREATE medicine_requests TABLE
CREATE TABLE IF NOT EXISTS public.medicine_requests (
  id TEXT PRIMARY KEY,
  med_id BIGINT,
  name TEXT NOT NULL,
  generic TEXT,
  manufacturer TEXT,
  quantity INTEGER DEFAULT 100,
  notes TEXT,
  photo TEXT,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_id TEXT,
  pharmacy_id TEXT,
  buyer_phone TEXT,
  date TEXT,
  status TEXT DEFAULT 'Pending Review',
  source TEXT DEFAULT 'Catalog Out-of-Stock',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medicine_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read medicine_requests" ON public.medicine_requests;
CREATE POLICY "Allow public read medicine_requests" ON public.medicine_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert medicine_requests" ON public.medicine_requests;
CREATE POLICY "Allow public insert medicine_requests" ON public.medicine_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update medicine_requests" ON public.medicine_requests;
CREATE POLICY "Allow public update medicine_requests" ON public.medicine_requests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete medicine_requests" ON public.medicine_requests;
CREATE POLICY "Allow public delete medicine_requests" ON public.medicine_requests FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_medicine_requests_buyer_email ON public.medicine_requests(buyer_email);
CREATE INDEX IF NOT EXISTS idx_medicine_requests_status ON public.medicine_requests(status);
