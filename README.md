# Personal AI Productivity Assistant

> Built with Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite` — theme tokens live in `src/index.css`, there's no `tailwind.config.js`).

A local-first, installable PWA for sales tracking, finance learning,
health tracking, task management, and AI assistance. No backend —
all data lives in your browser's LocalStorage.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed localhost URL in your browser.

## AI Assistant setup (optional)

1. Copy `.env.example` to `.env`
2. Get a free API key from https://openrouter.ai/keys
3. Paste it into `.env` as `VITE_OPENROUTER_API_KEY=...`

Without a key, every other module still works fully — only the AI tab needs it.

## Build for production

```bash
npm run build
```

This outputs a `dist/` folder — deploy it to Vercel, Netlify, or any static host.
Once deployed on HTTPS, the app becomes installable:
- **Android/Chrome**: menu → "Add to Home screen" / "Install app"
- **iOS/Safari**: Share → "Add to Home Screen"

## Convert to APK (optional)

If you want a shareable `.apk` file instead of a link:
1. Deploy the built app to any HTTPS host (e.g. Vercel — free)
2. Go to https://www.pwabuilder.com and paste your deployed URL
3. Download the generated Android package

## Data management

Go to **More → Settings** to export your data as JSON (backup),
import a previous backup, or clear everything.
