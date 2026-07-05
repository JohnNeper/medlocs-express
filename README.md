# MedLocs — Health cybersecurity for Cameroon

Bilingual (FR/EN) PWA that helps citizens find approved pharmacies, verify
prescriptions, detect counterfeit medications and get safe health guidance
via a Gemini-powered "Sentinel" assistant.

## 1. Set your Gemini API key

Get a free key at https://aistudio.google.com/apikey then create a `.env`
file at the project root:

```bash
cp .env.example .env
# edit .env and paste your key into GEMINI_API_KEY
```

The key is **server-only** — it is never sent to the browser.

## 2. Run locally

```bash
bun install
bun run dev
```

Open http://localhost:5173.

## 3. Deploy

The project is a lightweight TanStack Start SSR app. Any Node host works.

### Vercel (recommended, one click)

1. Push the repo to GitHub.
2. Import the project on https://vercel.com — the framework is auto-detected.
3. In **Settings → Environment Variables**, add `GEMINI_API_KEY`.
4. Redeploy.

### Any Node host (Render, Railway, Fly, VPS…)

```bash
bun install
bun run build
bun run start
```

Set `GEMINI_API_KEY` in the host's environment. That's it.

## Features

- 🏥 Real Leaflet map of approved pharmacies (open, on-duty, nearest)
- 📷 AI medication scanner — detects counterfeits from a photo
- 🧾 AI prescription verification — authenticity score + coherence
- 🤖 "Sentinel" chat — anti-self-medication guidance, never prescribes
- 🌍 Full FR/EN bilingual UI (toggle in the profile)
- 📱 Installable PWA with prompt

## Environment variables

| Variable          | Required | Default              | Purpose                     |
| ----------------- | -------- | -------------------- | --------------------------- |
| `GEMINI_API_KEY`  | ✅       | —                    | Google Gemini API key       |
| `GEMINI_MODEL`    | ❌       | `gemini-2.5-flash`   | Override the Gemini model   |
