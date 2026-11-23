/* ============================================
   RENVO - Shared sample data + data helpers
   Used by buyer-dashboard, seller-dashboard and product-detail.
   DEMO only: data is stored in localStorage so the demo feels real.
   No backend is involved.
   ============================================ */

/* ----- 1. Category list (matches the buyer dashboard sidebar) ----- */
const CATEGORIES = [
  "Smartphones",
  "Laptops",
  "Tablets",
  "Smartwatches",
  "Headphones",
  "Cameras",
  "Gaming Consoles",
  "Speakers",
  "Computer Accessories",
  "Other Electronics",
];

/* ----- 2. Inline SVG icons per category (for product images) ----- */
const CATEGORY_ICONS = {
  Smartphones:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.6"/><path d="M11 18h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  Laptops:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M2 20h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  Tablets:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M11 18h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  Smartwatches:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M9 6V3h6v3M9 18v3h6v-3M12 9v3l2 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  Headphones:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M4 14v-2a8 8 0 0 1 16 0v2" stroke="currentColor" stroke-width="1.6"/><rect x="2" y="13" width="4" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="18" y="13" width="4" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/></svg>',
  Cameras:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M3 8h3l2-2h8l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.6"/></svg>',
  "Gaming Consoles":
    '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="8" width="20" height="9" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M7 12v2M6 13h2M16 13h2M16 12v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  Speakers:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="2" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="15" r="3" stroke="currentColor" stroke-width="1.6"/></svg>',
  "Computer Accessories":
    '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6h12v8a6 6 0 0 1-12 0V6z" stroke="currentColor" stroke-width="1.6"/><path d="M9 6V4a2 2 0 0 1 4 0v2" stroke="currentColor" stroke-width="1.6"/></svg>',
  "Other Electronics":
    '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.6"/><path d="M14 2v6h6M9 13h6M9 17h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ----- 3. Sample product listings ----- */
/* Each product has 4 "images" (we use gradient tiles + icon since no real photos). */
const SAMPLE_PRODUCTS = [
  {
    id: "p1",
    name: "iPhone 13 Pro 128GB",
    brand: "Apple",
    model: "A2483",
    category: "Smartphones",
    price: 549,
    originalPrice: 999,
    condition: "Excellent",
    daysUsed: 420,
    location: "New York, USA",
    accessories: "Box, charger, cable, case",
    description:
      "Well-maintained iPhone 13 Pro in Sierra Blue. Battery health 91%. No scratches on screen, minor scuff on frame. Fully functional.",
    seller: { name: "Marcus L.", email: "marcus.l@renvo.example", phone: "+1 555 0101", rating: 4.8 },
  },
  {
    id: "p2",
    name: "MacBook Air M1 2020",
    brand: "Apple",
    model: "MGN93",
    category: "Laptops",
    price: 899,
    originalPrice: 1199,
    condition: "Like New",
    daysUsed: 300,
    location: "San Francisco, USA",
    accessories: "Charger, original box",
    description:
      "MacBook Air M1, 8GB RAM, 256GB SSD, Space Gray. Used gently for college. No dents or scratches.",
    seller: { name: "Priya S.", email: "priya.s@renvo.example", phone: "+1 555 0102", rating: 4.9 },
  },
  {
    id: "p3",
    name: "iPad Air 5th Gen",
    brand: "Apple",
    model: "MM9C3",
    category: "Tablets",
    price: 420,
    originalPrice: 599,
    condition: "Good",
    daysUsed: 250,
    location: "Austin, USA",
    accessories: "Apple Pencil 2, case",
    description:
      "iPad Air 5 with M1 chip, 64GB, Wi-Fi. Screen protector applied since day one. Small nick on corner.",
    seller: { name: "Tomás R.", email: "tomas.r@renvo.example", phone: "+1 555 0103", rating: 4.6 },
  },
  {
    id: "p4",
    name: "Apple Watch Series 8",
    brand: "Apple",
    model: "A2780",
    category: "Smartwatches",
    price: 299,
    originalPrice: 429,
    condition: "Excellent",
    daysUsed: 120,
    location: "Chicago, USA",
    accessories: "Band, charger",
    description:
      "Apple Watch Series 8, 45mm, Midnight. Battery excellent. No scratches.",
    seller: { name: "Lena K.", email: "lena.k@renvo.example", phone: "+1 555 0104", rating: 4.7 },
  },
  {
    id: "p5",
    name: "Sony WH-1000XM4",
    brand: "Sony",
    model: "WH1000XM4",
    category: "Headphones",
    price: 180,
    originalPrice: 349,
    condition: "Like New",
    daysUsed: 90,
    location: "Seattle, USA",
    accessories: "Case, cable, charger",
    description:
      "Industry-leading noise cancelling headphones. Excellent condition, replaced ear pads recently.",
    seller: { name: "Ade O.", email: "ade.o@renvo.example", phone: "+1 555 0105", rating: 4.5 },
  },
  {
    id: "p6",
    name: "Canon EOS R50 Kit",
    brand: "Canon",
    model: "EOS R50",
    category: "Cameras",
    price: 640,
    originalPrice: 799,
    condition: "Good",
    daysUsed: 200,
    location: "Denver, USA",
    accessories: "18-45mm lens, battery, charger, strap",
    description:
      "Canon EOS R50 mirrorless camera with kit lens. Great for beginners. Shutter count ~3000.",
    seller: { name: "Sofia M.", email: "sofia.m@renvo.example", phone: "+1 555 0106", rating: 4.8 },
  },
  {
    id: "p7",
    name: "PlayStation 5 Disc",
    brand: "Sony",
    model: "CFI-1015",
    category: "Gaming Consoles",
    price: 430,
    originalPrice: 499,
    condition: "Excellent",
    daysUsed: 380,
    location: "Miami, USA",
    accessories: "Controller, HDMI, power cable, box",
    description:
      "PS5 disc edition. Works perfectly. One controller included. Original box available.",
    seller: { name: "Jordan P.", email: "jordan.p@renvo.example", phone: "+1 555 0107", rating: 4.6 },
  },
  {
    id: "p8",
    name: "JBL Charge 5 Speaker",
    brand: "JBL",
    model: "JBLCHARGE5",
    category: "Speakers",
    price: 110,
    originalPrice: 179,
    condition: "Good",
    daysUsed: 150,
    location: "Boston, USA",
    accessories: "USB-C cable",
    description:
      "Waterproof Bluetooth speaker with powerful bass. Battery lasts ~20 hours.",
    seller: { name: "Dana W.", email: "dana.w@renvo.example", phone: "+1 555 0108", rating: 4.4 },
  },
  {
    id: "p9",
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    model: "910-006557",
    category: "Computer Accessories",
    price: 75,
    originalPrice: 99,
    condition: "Like New",
    daysUsed: 60,
    location: "Portland, USA",
    accessories: "USB receiver, cable",
    description:
      "Premium wireless mouse. Quiet clicks, ergonomic. Barely used.",
    seller: { name: "Yuki T.", email: "yuki.t@renvo.example", phone: "+1 555 0109", rating: 4.9 },
  },
  {
    id: "p10",
    name: "Anker GaN 100W Charger",
    brand: "Anker",
    model: "A2335",
    category: "Computer Accessories",
    price: 45,
    originalPrice: 79,
    condition: "Like New",
    daysUsed: 45,
    location: "Dallas, USA",
    accessories: "Power cable",
    description:
      "Compact 100W GaN charger with 4 ports. Fast charges laptops and phones.",
    seller: { name: "Sam B.", email: "sam.b@renvo.example", phone: "+1 555 0110", rating: 4.5 },
  },
  {
    id: "p11",
    name: "Samsung Galaxy S22 Ultra",
    brand: "Samsung",
    model: "SM-S908U",
    category: "Smartphones",
    price: 480,
    originalPrice: 1199,
    condition: "Good",
    daysUsed: 500,
    location: "Atlanta, USA",
    accessories: "S Pen, charger, case",
    description:
      "Galaxy S22 Ultra 256GB, Phantom Black. Screen perfect, minor frame wear. S Pen included.",
    seller: { name: "Ravi N.", email: "ravi.n@renvo.example", phone: "+1 555 0111", rating: 4.3 },
  },
  {
    id: "p12",
    name: "Dell XPS 13 9310",
    brand: "Dell",
    model: "XPS 13 9310",
    category: "Laptops",
    price: 780,
    originalPrice: 1299,
    condition: "Excellent",
    daysUsed: 210,
    location: "Phoenix, USA",
    accessories: "Charger, sleeve",
    description:
      "Dell XPS 13, i7, 16GB RAM, 512GB SSD. InfinityEdge display. Excellent condition.",
    seller: { name: "Omar F.", email: "omar.f@renvo.example", phone: "+1 555 0112", rating: 4.7 },
  },
];

/* ----- 4. localStorage data helpers -------------------------------- */
/* We keep a single "renvo_listings" key that mirrors SAMPLE_PRODUCTS,
   but with an added `status` field: "available" | "booked" | "sold".
   Offers are stored in "renvo_offers".
   Uploaded product photos are stored in IndexedDB (see section 4b). */

const DATA_KEYS = {
  listings: "renvo_listings",
  offers: "renvo_offers",
  images: "renvo_images_db", // IndexedDB database name for uploaded photos
};

// Get listings from localStorage, or seed them from SAMPLE_PRODUCTS.
function getListings() {
  try {
    const raw = localStorage.getItem(DATA_KEYS.listings);
    if (raw) return JSON.parse(raw);
  } catch {}
  // First run: seed listings as all "available".
  const seeded = SAMPLE_PRODUCTS.map((p) => ({ ...p, status: "available" }));
  localStorage.setItem(DATA_KEYS.listings, JSON.stringify(seeded));
  return seeded;
}

// Save listings back to localStorage.
function saveListings(listings) {
  localStorage.setItem(DATA_KEYS.listings, JSON.stringify(listings));
}

// Find a single listing by id.
function getListingById(id) {
  return getListings().find((p) => p.id === id) || null;
}

// Update one listing's status.
function setListingStatus(id, status) {
  const listings = getListings();
  const item = listings.find((p) => p.id === id);
  if (item) {
    item.status = status;
    saveListings(listings);
  }
}

// Add a new listing (from the Add Product page) to the front of the list.
function addListing(listing) {
  const listings = getListings();
  listings.unshift(listing);
  saveListings(listings);
  return listing;
}

// Generate a unique product id (timestamp + random suffix).
function generateProductId() {
  return "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Reset listings back to all "available" and clear uploaded images (useful for demos).
function resetListings() {
  const seeded = SAMPLE_PRODUCTS.map((p) => ({ ...p, status: "available" }));
  // Keep user-uploaded listings intact on reset so sellers don't lose work;
  // only re-seed the sample products.
  const current = getListings();
  const userUploads = current.filter((p) => p.userListing);
  saveListings([...userUploads, ...seeded]);
}

/* ----- 4b. IndexedDB image storage (uploaded product photos) -------- */
/* We store raw image Blobs in IndexedDB (large binary data doesn't belong
   in localStorage). Each photo is keyed by `${productId}__${slot}` where
   slot is 0..3 (front, back, left, right). Demo only — browser storage. */

function openImageDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DATA_KEYS.images, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Save (or replace) an image blob under a key.
async function saveImage(key, blob) {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readwrite");
    tx.objectStore("images").put({ id: key, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Read an image blob by key (or null if missing).
async function getImageBlob(key) {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readonly");
    const req = tx.objectStore("images").get(key);
    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    req.onerror = () => reject(req.error);
  });
}

// Delete a single image by key.
async function deleteImage(key) {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readwrite");
    tx.objectStore("images").delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Wipe all stored images (used by the demo reset, if ever needed).
async function clearAllImages() {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readwrite");
    tx.objectStore("images").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ----- Offers -----
// Each offer: { id, productId, productName, buyerName, amount, message, status, createdAt }
// status: "pending" | "accepted" | "rejected"

function getOffers() {
  try {
    const raw = localStorage.getItem(DATA_KEYS.offers);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveOffers(offers) {
  localStorage.setItem(DATA_KEYS.offers, JSON.stringify(offers));
}

function addOffer(offer) {
  const offers = getOffers();
  offer.id = "o" + Date.now();
  offer.status = "pending";
  offer.createdAt = Date.now();
  offers.push(offer);
  saveOffers(offers);
  return offer;
}

// Sample buyer offers (seeded the first time the seller dashboard loads).
function seedSampleOffersIfNeeded() {
  const offers = getOffers();
  if (offers.length > 0) return;
  const sample = [
    {
      id: "o-seed-1",
      productId: "p1",
      productName: "iPhone 13 Pro 128GB",
      buyerName: "Emma Clark",
      amount: 510,
      message: "Hi! Would you accept $510? I can pick it up this weekend.",
      status: "pending",
      createdAt: Date.now() - 86400000,
    },
    {
      id: "o-seed-2",
      productId: "p7",
      productName: "PlayStation 5 Disc",
      buyerName: "Liam Walker",
      amount: 400,
      message: " Interested in the PS5. Is $400 workable? Thanks!",
      status: "pending",
      createdAt: Date.now() - 43200000,
    },
  ];
  saveOffers(sample);
}

// Format a number as a USD price string.
function formatPrice(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

// Build a placeholder "image" tile using the category icon + gradient.
// We return 4 variants with slightly different hues so the detail page
// can show four distinct image slots.
function productImageHTML(category, index) {
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS["Other Electronics"];
  const grads = [
    "linear-gradient(135deg, var(--blue-50), var(--gray-100))",
    "linear-gradient(135deg, #e8f0ff, #eef2f7)",
    "linear-gradient(135deg, #eef2f7, var(--blue-50))",
    "linear-gradient(135deg, var(--blue-50), #f7f9fc)",
  ];
  const bg = grads[index % grads.length];
  return `<div class="prod-img" style="background:${bg}">${icon}</div>`;
}

// Expose everything globally.
window.RENVO_DATA = {
  CATEGORIES,
  CATEGORY_ICONS,
  SAMPLE_PRODUCTS,
  DATA_KEYS,
  getListings,
  saveListings,
  getListingById,
  setListingStatus,
  resetListings,
  getOffers,
  saveOffers,
  addOffer,
  seedSampleOffersIfNeeded,
  formatPrice,
  productImageHTML,
  addListing,
  generateProductId,
  saveImage,
  getImageBlob,
  deleteImage,
  clearAllImages,
};
