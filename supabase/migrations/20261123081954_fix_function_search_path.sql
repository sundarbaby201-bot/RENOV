/*
# Fix: set search_path on update_updated_at function

The update_updated_at trigger function had a mutable search_path, which
triggers a security warning. This sets an explicit search_path to close
that gap.
*/

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
