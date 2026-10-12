-- Migration: Create delivery_men table in Supabase
CREATE TABLE IF NOT EXISTS public.delivery_men (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  zones TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.delivery_men ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for buyer dashboard and admin)
CREATE POLICY "Allow public read delivery_men" ON public.delivery_men
  FOR SELECT USING (true);

-- Allow public insert (for admin adding delivery man)
CREATE POLICY "Allow public insert delivery_men" ON public.delivery_men
  FOR INSERT WITH CHECK (true);

-- Allow public update (for admin editing delivery man)
CREATE POLICY "Allow public update delivery_men" ON public.delivery_men
  FOR UPDATE USING (true);

-- Allow public delete (for admin deleting delivery man)
CREATE POLICY "Allow public delete delivery_men" ON public.delivery_men
  FOR DELETE USING (true);
