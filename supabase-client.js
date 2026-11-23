/* ============================================
   RENVO - Supabase Client Wrapper
   Shared singleton instance for all pages.
   Reads connection details from Vite env vars
   that Bolt populates automatically.
   ============================================ */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Whether cloud backend is configured (env vars present).
export const isCloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create the singleton client. If env vars are missing this will still
// construct an instance, but all calls will fail — the data layer checks
// isCloudConfigured before attempting cloud operations.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Storage bucket name for product images.
export const IMAGES_BUCKET = "product-images";

/* ----- Auth session helper ---------------------------------------- */
// Returns the current Supabase auth session (or null).
// Used by the data layer to determine if cloud operations are possible.
export async function getCloudSession() {
  if (!isCloudConfigured) return null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  } catch {
    return null;
  }
}

// Whether there is a real authenticated Supabase session.
export async function isCloudAuthenticated() {
  const session = await getCloudSession();
  return Boolean(session && session.user);
}

// Get the current cloud user (or null).
export async function getCloudUser() {
  const session = await getCloudSession();
  return session ? session.user : null;
}
