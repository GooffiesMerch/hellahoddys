DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef AND p.proname LIKE 'backend\_%'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM authenticated', f.nspname, f.proname, f.args);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC', f.nspname, f.proname, f.args);
  END LOOP;
END $$;
REVOKE EXECUTE ON FUNCTION public.backend_auth(text) FROM anon;