DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname LIKE 'backend\_%'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, authenticated', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, service_role', f.sig);
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.backend_auth(text) FROM PUBLIC, anon, authenticated;