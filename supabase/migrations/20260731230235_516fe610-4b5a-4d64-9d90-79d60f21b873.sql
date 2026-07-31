ALTER TABLE public.printful_products
  ADD COLUMN IF NOT EXISTS store_id BIGINT,
  ADD COLUMN IF NOT EXISTS store_name TEXT;

ALTER TABLE public.printful_variants
  ADD COLUMN IF NOT EXISTS store_id BIGINT;

CREATE INDEX IF NOT EXISTS printful_products_store_id_idx ON public.printful_products (store_id);
CREATE INDEX IF NOT EXISTS printful_variants_store_id_idx ON public.printful_variants (store_id);