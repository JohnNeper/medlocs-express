import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Pure SPA build (no Cloudflare Worker / no server runtime).
// The app talks to an external backend over HTTP from the browser.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: {
      enabled: true,
    },
  },
});
