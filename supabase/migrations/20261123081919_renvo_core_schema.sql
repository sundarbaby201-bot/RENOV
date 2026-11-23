/*
# RENVO Marketplace Core Schema

## Overview
Creates the three core tables for the RENVO pre-owned electronics marketplace:
users, products, and offers. This migration establishes the full database
structure with Row Level Security (RLS) policies that require authenticated users.

## 1. New Tables

### users
- `id` (uuid, primary key, references auth.users) — the authenticated user's ID
- `full_name` (text) — user's display name
- `email` (text, unique) — user's email address
- `phone` (text) — phone number
- `profile_info` (jsonb) — flexible profile metadata
- `created_at` (timestamptz) — account creation date
- `updated_at` (timestamptz) — last profile update

### products
- `id` (uuid, primary key) — unique product/listing ID
- `seller_id` (uuid, references auth.users) — the seller who created this listing
- `name` (text) — product name
- `brand` (text) — product brand
- `category` (text) — one of the 10 RENVO categories
- `model_number` (text) — model number
- `description` (text) — product description
- `purchase_date` (date) — when the seller originally bought the item
- `days_used` (integer) — days the product was used (auto-calculated)
- `original_price` (numeric) — original purchase price
- `expected_price` (numeric) — expected selling price
- `condition` (text) — Like New, Excellent, Good, or Fair
- `accessories` (text) — accessories included
- `seller_location` (text) — seller's location
- `contact_email` (text) — contact email for the listing
- `photo_front` (text) — URL to front view photo in Storage
- `photo_back` (text) — URL to back view photo
- `photo_left` (text) — URL to left side view photo
- `photo_right` (text) — URL to right side view photo
- `status` (text) — listing status: available, booked, or sold
- `created_at` (timestamptz) — listing creation date
- `updated_at` (timestamptz) — last update date

### offers
- `id` (uuid, primary key) — unique offer ID
- `product_id` (uuid, references products) — the product this offer is for
- `buyer_id` (uuid, references auth.users) — the buyer making the offer
- `seller_id` (uuid, references auth.users) — the seller who owns the product
- `offer_amount` (numeric) — amount the buyer is offering
- `buyer_message` (text) — optional message from buyer
- `status` (text) — pending, accepted, or rejected
- `created_at` (timestamptz) — offer creation date
- `updated_at` (timestamptz) — last status update date

## 2. Security (RLS + Grants)

### users
- RLS enabled. Authenticated users can read and update only their own row.
- seller_id defaults to auth.uid() so inserts from authenticated clients work.

### products
- RLS enabled. Authenticated users can:
  - SELECT all products (buyers need to browse all available listings)
  - INSERT only their own listings (seller_id = auth.uid())
  - UPDATE only their own listings (seller_id = auth.uid())
  - DELETE only their own listings
- seller_id defaults to auth.uid().

### offers
- RLS enabled. Authenticated users can:
  - SELECT offers where they are the buyer OR the seller of the linked product
  - INSERT offers only as the buyer (buyer_id = auth.uid())
  - UPDATE offers only as the seller of the linked product (to accept/reject)

## 3. Indexes
- products(seller_id) — fast lookup of a seller's own listings
- products(status) — fast filtering of available products for buyers
- products(category) — fast category filtering
- offers(product_id) — fast lookup of offers for a product
- offers(buyer_id) — fast lookup of a buyer's offers
- offers(seller_id) — fast lookup of a seller's received offers

## 4. Important Notes
1. This schema requires real Supabase authentication (auth.uid()). The
   existing demo login (localStorage-based) does NOT create real auth
   sessions. Real authentication will be implemented in Prompt 6.
2. seller_id and buyer_id columns default to auth.uid() so frontend inserts
   that omit the owner field still satisfy RLS policies.
3. No admin credentials or service keys are stored in frontend code.
4. Storage security rules (for product images) are configured separately
   on the product-images bucket.
*/

-- ===== USERS TABLE =====
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  profile_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own"
ON users FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own"
ON users FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own"
ON users FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ===== PRODUCTS TABLE =====
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  model_number text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  purchase_date date,
  days_used integer DEFAULT 0,
  original_price numeric NOT NULL DEFAULT 0,
  expected_price numeric NOT NULL DEFAULT 0,
  condition text NOT NULL DEFAULT 'Good',
  accessories text NOT NULL DEFAULT '',
  seller_location text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  photo_front text DEFAULT '',
  photo_back text DEFAULT '',
  photo_left text DEFAULT '',
  photo_right text DEFAULT '',
  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'booked', 'sold')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;

-- Buyers need to see all available products; sellers see their own.
DROP POLICY IF EXISTS "products_select_all" ON products;
CREATE POLICY "products_select_all"
ON products FOR SELECT TO authenticated
USING (true);

-- Sellers can only insert their own listings.
DROP POLICY IF EXISTS "products_insert_own" ON products;
CREATE POLICY "products_insert_own"
ON products FOR INSERT TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Sellers can only update their own listings.
DROP POLICY IF EXISTS "products_update_own" ON products;
CREATE POLICY "products_update_own"
ON products FOR UPDATE TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Sellers can only delete their own listings.
DROP POLICY IF EXISTS "products_delete_own" ON products;
CREATE POLICY "products_delete_own"
ON products FOR DELETE TO authenticated
USING (auth.uid() = seller_id);

-- ===== OFFERS TABLE =====
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_amount numeric NOT NULL DEFAULT 0,
  buyer_message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON offers TO authenticated;

-- Buyers see their own offers; sellers see offers on their products.
DROP POLICY IF EXISTS "offers_select_parties" ON offers;
CREATE POLICY "offers_select_parties"
ON offers FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can insert offers only as themselves.
DROP POLICY IF EXISTS "offers_insert_buyer" ON offers;
CREATE POLICY "offers_insert_buyer"
ON offers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update offers on their products (to accept/reject).
DROP POLICY IF EXISTS "offers_update_seller" ON offers;
CREATE POLICY "offers_update_seller"
ON offers FOR UPDATE TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);

-- ===== UPDATED_AT TRIGGER =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS offers_updated_at ON offers;
CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
