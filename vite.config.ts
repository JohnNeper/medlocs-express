import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SSR léger (Node) — nécessaire pour appeler Lovable AI Gateway côté serveur
// sans exposer la LOVABLE_API_KEY au navigateur. Vercel auto-détecte TSS.
export default defineConfig({
  cloudflare: false,
});
