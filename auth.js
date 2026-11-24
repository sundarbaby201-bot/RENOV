/* ============================================
   RENVO - Auth helper (Vanilla JS, shared)
   Used by signup, login, otp, role-selection, dashboards, and add-product.
   --------------------------------------------
   REAL AUTHENTICATION via Supabase Auth.
   - Email/password signup with OTP email verification.
   - Email/password login.
   - Password reset via email.
   - Session persistence handled by Supabase (localStorage-backed).
   - Role (buyer/seller) stored in localStorage as a UI preference.
   --------------------------------------------
   SECURITY: No service role keys are used here. Only the anon key
   (already in the Supabase client) is used for client-side auth.
   Never store plain-text passwords — Supabase Auth handles hashing.
   ============================================ */

import { supabase, isCloudConfigured, getCloudUser } from "./supabase-client.js";

/* ----- 1. Local storage keys (UI preferences only) ----- */
const STORAGE_KEYS = {
  role: "renvo_selected_role", // buyer | seller — UI preference only
};

/* ----- 2. Small DOM helpers ----- */

// Show a toast message. Each auth page has a #toast element.
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2800);
}

/* ----- 3. Validation helpers (kept from original) ----- */
function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  const digits = value.replace(/[^\d]/g, "");
  return /^[+\d\s()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
}

/* ----- 4. Show / hide password toggle ----- */
function setupPasswordToggles() {
  document.querySelectorAll(".password-field").forEach((field) => {
    const input = field.querySelector("input");
    const toggle = field.querySelector(".toggle-password");
    if (!input || !toggle) return;
    toggle.addEventListener("click", () => {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.textContent = isPassword ? "Hide" : "Show";
      input.focus();
    });
  });
}

/* ----- 5. Session management (real Supabase auth) ----- */

// Cache the current Supabase session synchronously so pages that call
// requireSession() can work without async/await. Supabase persists the
// session in localStorage, so we read it on load.
let cachedSession = null;
let cachedProfile = null;

// Initialize the cached session from Supabase's stored session.
async function initCachedSession() {
  if (!isCloudConfigured) return;
  try {
    const { data } = await supabase.auth.getSession();
    if (data && data.session) {
      cachedSession = data.session;
      // Fetch the user's profile (full_name, phone) from the users table.
      await refreshCachedProfile();
    } else {
      cachedSession = null;
      cachedProfile = null;
    }
  } catch {
    cachedSession = null;
  }
}

// Fetch the user's profile row from the `users` table.
async function refreshCachedProfile() {
  if (!cachedSession || !cachedSession.user) return;
  try {
    const { data } = await supabase
      .from("users")
      .select("full_name, email, phone")
      .eq("id", cachedSession.user.id)
      .maybeSingle();
    cachedProfile = data || null;
  } catch {
    cachedProfile = null;
  }
}

// Listen for auth state changes to keep the cache in sync.
// This handles login, logout, token refresh, and session restore.
if (isCloudConfigured) {
  supabase.auth.onAuthStateChange((event, session) => {
    // Wrap async work in an IIFE to avoid deadlock (per Supabase docs).
    (async () => {
      if (event === "SIGNED_OUT") {
        cachedSession = null;
        cachedProfile = null;
        localStorage.removeItem(STORAGE_KEYS.role);
      } else if (session) {
        cachedSession = session;
        await refreshCachedProfile();
      }
    })();
  });
}

// Initialize the session cache immediately on script load.
initCachedSession();

/* ----- 6. Synchronous session access (for dashboard pages) ----- */

// Returns a session-like object synchronously, or null.
// This mirrors the old demo API shape: { email, fullName, role }.
function getSession() {
  if (!cachedSession || !cachedSession.user) return null;
  const user = cachedSession.user;
  const fullName = cachedProfile ? cachedProfile.full_name : (user.user_metadata?.full_name || "");
  return {
    email: user.email || "",
    fullName: fullName || "",
    phone: cachedProfile ? cachedProfile.phone : (user.user_metadata?.phone || ""),
    role: localStorage.getItem(STORAGE_KEYS.role) || null,
    uid: user.id,
    createdAt: user.created_at,
  };
}

// Guard pages that need a session. If not logged in, redirect to login.
// Returns the session object or null.
function requireSession() {
  const session = getSession();
  if (!session) {
    window.location.href = "/login.html";
    return null;
  }
  return session;
}

// If already logged in, skip auth pages (go to role selection).
function redirectIfLoggedIn() {
  if (getSession()) {
    window.location.href = "/role-selection.html";
  }
}

// Set the selected role (buyer/seller) — stored as a UI preference.
function setSelectedRole(role) {
  localStorage.setItem(STORAGE_KEYS.role, role);
}

// Get the selected role.
function getSelectedRole() {
  return localStorage.getItem(STORAGE_KEYS.role) || null;
}

// Logout: sign out from Supabase and clear local preferences.
async function clearSession() {
  if (isCloudConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }
  cachedSession = null;
  cachedProfile = null;
  localStorage.removeItem(STORAGE_KEYS.role);
}

/* ----- 7. Demo banner (kept for pages that still show it) ----- */
function demoBannerHTML() {
  return `
    <div class="demo-banner" role="note">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
        <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <span><strong>Secure auth:</strong> Registration and login use Supabase Auth. Email verification is sent via Supabase's email service.</span>
    </div>
  `;
}

/* ----- 8. Profile fetch helper (async, for pages that need it) ----- */
async function fetchProfile() {
  if (!cachedSession) return null;
  await refreshCachedProfile();
  return cachedProfile;
}

/* ----- Expose globally ----- */
window.RENVO = {
  STORAGE_KEYS,
  showToast,
  isEmail,
  isPhone,
  setupPasswordToggles,
  getSession,
  requireSession,
  redirectIfLoggedIn,
  clearSession,
  setSelectedRole,
  getSelectedRole,
  demoBannerHTML,
  fetchProfile,
  // Expose the supabase client for pages that need direct access.
  supabase,
  isCloudConfigured,
};
