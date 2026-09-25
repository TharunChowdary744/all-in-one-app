# OmniKit

**Every everyday tool, in one kit.** OmniKit puts image converters, PDF tools, document converters, text utilities, developer helpers, unit and color converters, and security tools behind one dashboard. It ships as:

- **Web**: React 19, Vite and React Router (`apps/web`)
- **Mobile**: React Native with Expo SDK 57 and Expo Router, for iOS and Android (`apps/mobile`)

Both apps share one tool registry and all pure conversion logic through `@omnikit/core`. Everything runs **on the device**. Files are never uploaded anywhere.

## Tools

| Category | Tool | Web | Mobile |
| --- | --- | :---: | :---: |
| 🖼️ Image | Image Converter (PNG ⇄ JPG ⇄ WEBP, batch) | ✅ | ✅ |
| | Image Resizer / Compressor | ✅ | ✅ |
| 📕 PDF | Images → PDF | ✅ | ✅ |
| | Merge PDF | ✅ | 🌐 |
| | Split PDF (ranges, every N pages, per page) | ✅ | 🌐 |
| | PDF → Images (PNG/JPG) | ✅ | 🌐 |
| 📄 Documents | PDF → Word (.docx) | ✅ | 🌐 |
| | Word (.docx) → HTML / Text | ✅ | 🌐 |
| | Markdown → HTML | ✅ | ✅ |
| | CSV ⇄ JSON | ✅ | ✅ |
| ✍️ Text | Word Counter, Case Converter, Text Cleaner | ✅ | ✅ |
| 🧑‍💻 Developer | JSON Formatter, Base64, URL Encoder, UUID, QR Code | ✅ | ✅ |
| 🔁 Converters | Units (8 groups), Colors (HEX/RGB/HSL), Unix Timestamps | ✅ | ✅ |
| 🔐 Security | Password Generator, Hash Generator (MD5/SHA-1/256/384/512, text or file) | ✅ | ✅ |

🌐 means the mobile app shows the tool in its dashboard and points users to the web app. These tools depend on pdf.js, pdf-lib and mammoth, which rely on browser APIs.

### Dashboard features

- Hero search plus a global command palette (<kbd>⌘/Ctrl</kbd> + <kbd>K</kbd>) with ranked keyword search
- Favorites, recently used tools and usage stats, saved locally (localStorage on web, AsyncStorage on mobile)
- Category browsing, featured tools and "Web only" badges
- Light and dark themes (the web app follows the system or a manual toggle), responsive down to phone width

## Repository layout

```
.
├── apps/
│   ├── web/          # React + Vite web app
│   │   └── src/
│   │       ├── layout/     # App shell: sidebar, top bar, command palette
│   │       ├── pages/      # Dashboard, category, favorites, tool page
│   │       ├── tools/      # One code-split component per tool
│   │       └── lib/        # Browser helpers (canvas, pdf.js, downloads)
│   └── mobile/       # Expo / React Native app
│       └── src/
│           ├── app/        # Expo Router routes: (tabs), tool/[id], category/[id]
│           ├── tools/      # Native tool screens
│           └── lib/        # Image manipulation, sharing, file helpers
└── packages/
    └── core/         # @omnikit/core: registry + platform-agnostic logic (+ tests)
```

## Getting started

Requirements: **Node 20+** and **npm 11+**. npm 10 hits an arborist bug with this workspace layout; run `npm i -g npm@11` or use `npx npm@11 install`.

```bash
npm install          # installs every workspace

npm run web          # web dev server at http://localhost:5173
npm run web:build    # production build → apps/web/dist

npm run mobile       # Expo dev server (scan the QR code with Expo Go, or press a / i)
npm run mobile:android
npm run mobile:ios

npm test             # unit tests for @omnikit/core (Vitest)
npm run typecheck    # TypeScript across all workspaces
```

## Deployment

- **Web**: every push to `main` (or the current development branch) builds `apps/web` and publishes it to GitHub Pages at
  <https://tharunchowdary744.github.io/all-in-one-app/> (`.github/workflows/deploy-web.yml`).
- **Android**: `.github/workflows/android-release.yml` builds with EAS and submits to Google Play automatically.
  It needs a one-time setup described in [docs/PLAY_STORE.md](docs/PLAY_STORE.md).
- **Privacy policy** (required by the stores): <https://tharunchowdary744.github.io/all-in-one-app/privacy.html>

## Adding a new tool

1. Register it in `packages/core/src/registry/tools.ts` with an id, name, category, icon, keywords and `platforms`.
2. Put any pure logic in `packages/core/src/lib/` and export it from `src/index.ts`. Add tests in `packages/core/test`.
3. Web: create `apps/web/src/tools/MyTool.tsx` and add it to the map in `apps/web/src/tools/index.ts`.
4. Mobile: create `apps/mobile/src/tools/MyTool.tsx` and add it to `apps/mobile/src/tools/index.ts`. If you leave it out, the tool appears with a "use the web app" screen.

The dashboards, search, categories and favorites pick the new tool up automatically.

## How it works

- `@omnikit/core` ships TypeScript source (no build step). Vite and Metro both compile it directly, and Metro's monorepo support resolves it through npm workspaces.
- Randomness (passwords, UUIDs) uses a CSPRNG. On web that's `crypto.getRandomValues`. On mobile the core is wired to `expo-crypto` through `setRandomSource`.
- Web conversions use Canvas (images), [pdf-lib](https://pdf-lib.js.org) (merge, split, images→PDF), [pdf.js](https://mozilla.github.io/pdf.js/) (text extraction and rendering), [docx](https://docx.js.org) (Word output) and [mammoth](https://github.com/mwilliamson/mammoth.js) (Word input). Converted HTML is sanitized with DOMPurify before it's rendered.
- Mobile conversions use `expo-image-manipulator`, `expo-print` (HTML → PDF) and `expo-file-system` + `expo-sharing` for output.
