-- Ensure RLS is on for all three tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printful_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printful_variants ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

-- Explicitly remove any client-role privileges (deny by default)
REVOKE ALL ON public.orders FROM anon, authenticated;
REVOKE ALL ON public.printful_products FROM anon, authenticated;
REVOKE ALL ON public.printful_variants FROM anon, authenticated;

-- Backend (service role) keeps full access
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.printful_products TO service_role;
GRANT ALL ON public.printful_variants TO service_role;

-- Explicit deny policies so no future permissive policy is assumed
DROP POLICY IF EXISTS "orders_no_client_access" ON public.orders;
CREATE POLICY "orders_no_client_access" ON public.orders
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "printful_products_no_client_access" ON public.printful_products;
CREATE POLICY "printful_products_no_client_access" ON public.printful_products
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "printful_variants_no_client_access" ON public.printful_variants;
CREATE POLICY "printful_variants_no_client_access" ON public.printful_variants
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);