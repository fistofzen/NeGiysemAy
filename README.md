# Ne Giysem Ay

Production-ready MVP for a wardrobe management and AI-powered outfit suggestion platform built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Prisma.

## Features
- Email/password authentication with secure session cookies
- Profile management with style preferences and body metrics
- Wardrobe catalog with local image uploads, AI-assisted tagging, and item delete actions
- AI-assisted outfit generation using wardrobe inventory and weather insights (mock services)
- Visual mannequin preview that layers wardrobe items over a silhouette
- Dashboard with weather, quick actions, and recent outfits

## Prerequisites
- Node.js 18+
- PostgreSQL database
- npm

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in the required values:
   ```bash
   cp .env .env.local
   ```
   - `AI_API_KEY` should point to a valid OpenAI API key.
   - (Optional) `AI_MODEL` lets you override the default `gpt-4o-mini` model.
   - (Optional) `STORAGE_DRIVER` defaults to `local`. Cloud storage integrations can be wired into `lib/storage/storage.ts` later.
   - (Optional) `VTON_API_URL` and `VTON_API_KEY` enable forwarding `/api/virtual-try-on` calls to a managed provider; set `VTON_PROVIDER_NAME` to label responses in logs/UI.
   - (Optional) `GENERATIVE_TRYON_MODEL` overrides the default `gpt-image-1` model when using the OpenAI-driven generative preview (`/api/virtual-try-on/generative`).
    - (Optional) To use Google Vertex AI Imagen Virtual Try-On (Preview), set:
       - `VTON_PROVIDER_NAME=vertex`
       - `GCP_PROJECT_ID` (or `GOOGLE_CLOUD_PROJECT`)
       - `VERTEX_LOCATION` (default `us-central1`)
       - `VERTEX_PUBLISHER` (default `google`)
       - `VERTEX_VIRTUAL_TRYON_MODEL` (default `imagen-virtual-try-on-preview-08-04`)
       - Provide service account credentials via `GOOGLE_APPLICATION_CREDENTIALS` or workload identity so the server can mint access tokens.
3. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
4. (Optional) Seed initial data:
   ```bash
   npm run prisma:seed
   ```

## Development
- Start the dev server:
  ```bash
  npm run dev
  ```
- Lint the project:
  ```bash
  npm run lint
  ```
- Build for production:
  ```bash
  npm run build
  ```

## Testing Notes
- Prisma uses the default datasource from `.env.local`.
- AI outfit generation still uses the mock pipeline; wardrobe image analysis relies on the `AI_API_KEY`. If the key is absent, a deterministic fallback categorisation is used.
- Outfit previews render remote placeholders from `picsum.photos`; update `next.config.mjs` if you introduce additional image domains.

## Advanced Visual Try-On
- A lightweight mannequin overlay is bundled by default.
- Regenerate the mannequin asset with `node scripts/generate-mannequin.mjs` if you tweak the template.
- Call `/api/virtual-try-on` to proxy managed providers (e.g. ZMO.AI) or Google Vertex AI Imagen Virtual Try-On when `VTON_PROVIDER_NAME=vertex`. `/api/virtual-try-on/generative` leverages OpenAI `gpt-image-1` for concept renders based on user reference photos.
- For full virtual try-on support, review `docs/virtual-try-on-roadmap.md` for GPU hosting and managed API options.
- File uploads use the pluggable storage helper in `lib/storage/storage.ts`; the default `local` driver stores wardrobe images under `public/uploads/`. These files are git-ignored but served statically during development, so migrate to a cloud-backed driver before production.
