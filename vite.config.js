import { defineConfig } from "vite";
import { resolve } from "path";

// List every HTML page as an entry point so Vite builds them all.
const pages = [
  "index",
  "signup",
  "login",
  "otp",
  "role-selection",
  "buyer-dashboard",
  "seller-dashboard",
  "product-detail",
  "add-product",
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((name) => [name, resolve(__dirname, `${name}.html`)])
      ),
    },
  },
});
