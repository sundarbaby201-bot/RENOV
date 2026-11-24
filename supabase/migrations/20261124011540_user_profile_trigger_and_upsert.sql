/*
# Auto-create user profile on signup + upsert profile RPC

## Overview
1. Creates a `handle_new_user` trigger function that automatically inserts
   a row into the `users` profile table whenever a new user registers in
   `auth.users`. This ensures every authenticated user has a profile row.
2. Attaches the trigger to `auth.users` on INSERT.
3. Creates an `upsert_user_profile` SECURITY DEFINER function that lets an
   authenticated user set/update their own `full_name` and `phone` after
   signup. This is needed because the RLS policy on `users` only allows
   inserts where `auth.uid() = id`, but the Supabase auth.signUp() call
   creates the auth.users row server-side — the client insert would have
   a different UUID timing. The trigger handles creation; this RPC handles
   updates of name/phone.

## Security
- `handle_new_user` is SECURITY DEFINER (runs as the owner) so it can
  insert into the `users` table regardless of the caller's RLS. It only
  runs on INSERT into auth.users (a system table users cannot write to
  directly), so this is safe.
- `upsert_user_profile` is SECURITY DEFINER with `auth.uid()` validation
  inside the body. It only updates the row matching the caller's own id.
  EXECUTE is revoked from PUBLIC/anon and granted only to authenticated.

## Important Notes
1. The trigger reads `raw_user_meta_data->>'full_name'` and
   `raw_user_meta_data->>'phone'` from the auth user's metadata. The
   frontend signUp() call passes these as the `options.data` parameter,
   which Supabase stores in `raw_user_meta_data`.
2. Email is taken from the auth user's email column directly.
*/

-- ===== Trigger: auto-create profile on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if re-running, then create fresh.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== RPC: upsert own profile (name + phone) =====
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_full_name text DEFAULT NULL,
  p_phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Only allow the authenticated caller to update their own row.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.users (id, email, full_name, phone)
  VALUES (
    auth.uid(),
    COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), ''),
    COALESCE(p_full_name, ''),
    COALESCE(p_phone, '')
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(p_full_name, users.full_name),
        phone = COALESCE(p_phone, users.phone),
        updated_at = now();
END;
$$;

-- Revoke default PUBLIC execute, grant only to authenticated.
REVOKE EXECUTE ON FUNCTION public.upsert_user_profile(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(text, text) TO authenticated;
