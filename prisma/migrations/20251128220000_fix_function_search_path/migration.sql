-- Fix search_path security issue for recipecache_set_updated_at function
-- This prevents SQL injection by ensuring the function uses a fixed search_path

CREATE OR REPLACE FUNCTION public.recipecache_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

