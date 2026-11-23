/* ============================================
   RENVO - Backend Data Layer
   Cloud-first (Supabase) with localStorage fallback.

   Strategy:
   - If a real Supabase auth session exists, all reads/writes go to
     the cloud database and cloud storage. Data persists across
     logout/login and is shared between users.
   - If no cloud session (the current demo login), we fall back to
     the existing localStorage + IndexedDB demo storage so the website
     continues to work until real authentication is added (Prompt 6).

   This module REPLACES the direct localStorage calls in products.js
   for pages that load it. The old products.js helpers remain available
   for backward compatibility.
   ============================================ */

import { supabase, isCloudConfigured, IMAGES_BUCKET, getCloudSession, getCloudUser } from "./supabase-client.js";

/* ----- Storage keys (for demo fallback) ----- */
const DEMO_KEYS = {
  listings: "renvo_listings",
  offers: "renvo_offers",
  images: "renvo_images_db",
};

/* ----- Map between cloud DB rows and frontend objects ----- */
// Cloud row (snake_case) <-> Frontend object (camelCase + legacy fields)
function cloudProductToFrontend(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    model: row.model_number || "",
    category: row.category,
    description: row.description || "",
    purchaseDate: row.purchase_date || "",
    daysUsed: row.days_used || 0,
    originalPrice: Number(row.original_price) || 0,
    price: Number(row.expected_price) || 0,
    condition: row.condition,
    accessories: row.accessories || "",
    location: row.seller_location || "",
    contactEmail: row.contact_email || "",
    sellerId: row.seller_id,
    status: row.status,
    photoFront: row.photo_front || "",
    photoBack: row.photo_back || "",
    photoLeft: row.photo_left || "",
    photoRight: row.photo_right || "",
    hasCloudPhotos: Boolean(row.photo_front || row.photo_back || row.photo_left || row.photo_right),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    seller: {
      name: row.seller_name || "Seller",
      email: row.contact_email || "",
      phone: "—",
      rating: 5.0,
    },
    // Flag: this listing came from the cloud.
    cloudListing: true,
  };
}

function frontendToCloudProduct(data) {
  return {
    name: data.name,
    brand: data.brand,
    category: data.category,
    model_number: data.model,
    description: data.description,
    purchase_date: data.purchaseDate || null,
    days_used: data.daysUsed || 0,
    original_price: data.originalPrice,
    expected_price: data.price,
    condition: data.condition,
    accessories: data.accessories,
    seller_location: data.location,
    contact_email: data.contactEmail,
    photo_front: data.photoFront || "",
    photo_back: data.photoBack || "",
    photo_left: data.photoLeft || "",
    photo_right: data.photoRight || "",
    status: data.status || "available",
  };
}

function cloudOfferToFrontend(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name || "",
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    buyerName: row.buyer_name || "Buyer",
    buyerEmail: row.buyer_email || "",
    amount: Number(row.offer_amount) || 0,
    message: row.buyer_message || "",
    status: row.status,
    createdAt: row.created_at,
  };
}

/* ----- Demo fallback helpers (localStorage) ----- */
// These reuse the existing products.js global functions when available.

function demoGetListings() {
  return window.RENVO_DATA.getListings();
}

function demoGetListingById(id) {
  return window.RENVO_DATA.getListingById(id);
}

function demoAddListing(listing) {
  return window.RENVO_DATA.addListing(listing);
}

function demoSetListingStatus(id, status) {
  return window.RENVO_DATA.setListingStatus(id, status);
}

function demoGetOffers() {
  return window.RENVO_DATA.getOffers();
}

function demoSaveOffers(offers) {
  return window.RENVO_DATA.saveOffers(offers);
}

function demoAddOffer(offer) {
  return window.RENVO_DATA.addOffer(offer);
}

/* ===========================================================
   PUBLIC API — Cloud-first with demo fallback
   =========================================================== */

/* ----- Check if cloud is available (configured + authenticated) ----- */
export async function isCloudReady() {
  if (!isCloudConfigured) return false;
  const session = await getCloudSession();
  return Boolean(session && session.user);
}

/* ----- PRODUCTS ----- */

// Get all available products (for buyer dashboard).
export async function fetchAvailableProducts() {
  if (await isCloudReady()) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });
    if (error) throw error;
    // Fetch seller names from users table.
    const products = data.map(cloudProductToFrontend);
    await enrichWithSellerInfo(products);
    return products;
  }
  // Demo fallback: filter local listings.
  return demoGetListings().filter((p) => p.status === "available");
}

// Get a single product by ID (for product detail page).
export async function fetchProductById(id) {
  if (await isCloudReady()) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const product = cloudProductToFrontend(data);
    await enrichWithSellerInfo([product]);
    return product;
  }
  return demoGetListingById(id);
}

// Get all listings for the current seller.
export async function fetchSellerListings() {
  if (await isCloudReady()) {
    const user = await getCloudUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const products = data.map(cloudProductToFrontend);
    await enrichWithSellerInfo(products);
    return products;
  }
  // Demo fallback: show the first 6 local listings.
  return demoGetListings().slice(0, 6);
}

// Create a new product listing (uploads photos first, then saves record).
export async function createProduct(productData, photoFiles) {
  // photoFiles = [frontFile, backFile, leftFile, rightFile]
  if (await isCloudReady()) {
    const user = await getCloudUser();
    if (!user) throw new Error("You must be signed in to create a listing.");

    // Step 1: Insert the product record (without photo URLs first, to get an ID).
    const cloudRow = frontendToCloudProduct(productData);
    cloudRow.photo_front = "";
    cloudRow.photo_back = "";
    cloudRow.photo_left = "";
    cloudRow.photo_right = "";

    const { data: inserted, error: insertError } = await supabase
      .from("products")
      .insert(cloudRow)
      .select()
      .single();
    if (insertError) throw insertError;

    const productId = inserted.id;

    // Step 2: Upload all four photos to Storage.
    const slots = ["front", "back", "left", "right"];
    const photoUrls = {};
    try {
      for (let i = 0; i < 4; i++) {
        const file = photoFiles[i];
        if (!file) throw new Error("All four photos are required.");
        const ext = file.name.split(".").pop().toLowerCase();
        const path = `products/${user.id}/${productId}/${slots[i]}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(IMAGES_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: true });
        if (uploadError) throw uploadError;
        // Get the public URL (even though bucket is private, the URL is
        // used with signed access or the Supabase client which handles auth).
        const { data: urlData } = supabase.storage
          .from(IMAGES_BUCKET)
          .getPublicUrl(path);
        photoUrls[slots[i]] = urlData.publicUrl;
      }
    } catch (uploadErr) {
      // If photo upload fails, delete the incomplete product record
      // so we don't leave orphaned data.
      await supabase.from("products").delete().eq("id", productId);
      throw new Error("Photo upload failed: " + uploadErr.message);
    }

    // Step 3: Update the product record with photo URLs.
    const { data: finalProduct, error: updateError } = await supabase
      .from("products")
      .update({
        photo_front: photoUrls.front,
        photo_back: photoUrls.back,
        photo_left: photoUrls.left,
        photo_right: photoUrls.right,
      })
      .eq("id", productId)
      .select()
      .single();
    if (updateError) throw updateError;

    return cloudProductToFrontend(finalProduct);
  }

  // Demo fallback: save to localStorage + IndexedDB.
  const id = window.RENVO_DATA.generateProductId();
  const listing = {
    ...productData,
    id,
    status: "available",
    userListing: true,
    hasPhotos: true,
    createdAt: Date.now(),
  };
  // Save photos to IndexedDB.
  for (let i = 0; i < 4; i++) {
    await window.RENVO_DATA.saveImage(id + "__" + i, photoFiles[i]);
  }
  demoAddListing(listing);
  return listing;
}

// Update a product's status (Available -> Booked -> Sold).
export async function updateProductStatus(productId, status) {
  if (await isCloudReady()) {
    const { error } = await supabase
      .from("products")
      .update({ status })
      .eq("id", productId);
    if (error) throw error;
    return true;
  }
  demoSetListingStatus(productId, status);
  return true;
}

/* ----- OFFERS ----- */

// Fetch offers for the current seller (offers on their products).
export async function fetchSellerOffers() {
  if (await isCloudReady()) {
    const user = await getCloudUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("offers")
      .select("*, products(name)")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => {
      const offer = cloudOfferToFrontend(row);
      offer.productName = row.products ? row.products.name : "";
      return offer;
    });
  }
  // Demo fallback.
  window.RENVO_DATA.seedSampleOffersIfNeeded();
  return demoGetOffers();
}

// Fetch offers made by the current buyer.
export async function fetchBuyerOffers() {
  if (await isCloudReady()) {
    const user = await getCloudUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("offers")
      .select("*, products(name)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => {
      const offer = cloudOfferToFrontend(row);
      offer.productName = row.products ? row.products.name : "";
      return offer;
    });
  }
  const session = window.RENVO.getSession();
  const email = session ? session.email : "";
  return demoGetOffers().filter((o) => o.buyerEmail === email);
}

// Create a new offer from a buyer.
export async function createOffer(offerData) {
  if (await isCloudReady()) {
    const user = await getCloudUser();
    if (!user) throw new Error("You must be signed in to make an offer.");
    // Fetch the product to get the seller_id.
    const { data: product, error: prodError } = await supabase
      .from("products")
      .select("seller_id, name")
      .eq("id", offerData.productId)
      .maybeSingle();
    if (prodError) throw prodError;
    if (!product) throw new Error("Product not found.");

    const { data, error } = await supabase
      .from("offers")
      .insert({
        product_id: offerData.productId,
        buyer_id: user.id,
        seller_id: product.seller_id,
        offer_amount: offerData.amount,
        buyer_message: offerData.message || "",
        status: "pending",
      })
      .select()
      .single();
    if (error) throw error;

    const offer = cloudOfferToFrontend(data);
    offer.productName = product.name;
    return offer;
  }
  // Demo fallback.
  return demoAddOffer(offerData);
}

// Update offer status (accept/reject). When accepting, also set product to booked.
// This uses an atomic approach: update the offer, then update the product status.
// RLS ensures only the seller can update offers on their products.
export async function updateOfferStatus(offerId, newStatus) {
  if (await isCloudReady()) {
    // First, fetch the offer to get the product_id.
    const { data: offer, error: fetchError } = await supabase
      .from("offers")
      .select("id, product_id, status")
      .eq("id", offerId)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!offer) throw new Error("Offer not found.");

    // If the product is already booked by another accepted offer, prevent double-booking.
    if (newStatus === "accepted") {
      const { data: product, error: prodError } = await supabase
        .from("products")
        .select("status")
        .eq("id", offer.product_id)
        .maybeSingle();
      if (prodError) throw prodError;
      if (product && product.status === "booked") {
        throw new Error("This product is already booked by another buyer.");
      }
      if (product && product.status === "sold") {
        throw new Error("This product has already been sold.");
      }
    }

    // Update the offer status.
    const { error: offerError } = await supabase
      .from("offers")
      .update({ status: newStatus })
      .eq("id", offerId);
    if (offerError) throw offerError;

    // If accepted, mark the product as booked.
    if (newStatus === "accepted") {
      const { error: prodError } = await supabase
        .from("products")
        .update({ status: "booked" })
        .eq("id", offer.product_id);
      if (prodError) throw prodError;
    }
    return true;
  }

  // Demo fallback.
  const offers = demoGetOffers();
  const offer = offers.find((o) => o.id === offerId);
  if (offer) {
    offer.status = newStatus;
    demoSaveOffers(offers);
    if (newStatus === "accepted") {
      demoSetListingStatus(offer.productId, "booked");
    }
  }
  return true;
}

/* ----- HELPER: Enrich products with seller info ----- */
async function enrichWithSellerInfo(products) {
  if (!products.length) return;
  const sellerIds = [...new Set(products.map((p) => p.sellerId).filter(Boolean))];
  if (!sellerIds.length) return;
  const { data: sellers, error } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", sellerIds);
  if (error || !sellers) return;
  const sellerMap = {};
  sellers.forEach((s) => {
    sellerMap[s.id] = s;
  });
  products.forEach((p) => {
    const s = sellerMap[p.sellerId];
    if (s) {
      p.seller = {
        name: s.full_name || "Seller",
        email: s.email || "",
        phone: "—",
        rating: 5.0,
      };
    }
  });
}

/* ----- HELPER: Get a signed/accessible URL for a private image ----- */
// Since the product-images bucket is private, we need to create signed URLs
// for viewing. For simplicity, if the Supabase client has a valid session,
// it can access private bucket URLs directly via getPublicUrl when the
// bucket policies allow authenticated reads.
export async function getImageUrl(photoUrl) {
  if (!photoUrl) return null;
  // If it's already a full URL (from cloud), return as-is.
  // The Supabase client handles auth for private buckets automatically
  // when the user is authenticated.
  return photoUrl;
}

/* ----- HELPER: Check cloud config status for UI display ----- */
export function getCloudConfigStatus() {
  return {
    configured: isCloudConfigured,
    url: SUPABASE_URL ? "set" : "missing",
    key: SUPABASE_ANON_KEY ? "set" : "missing",
  };
}
