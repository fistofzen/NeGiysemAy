# Ne Giysem Ay

Production-ready MVP for a wardrobe management and AI-powered outfit suggestion platform built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Prisma.

## Features
- Email/password authentication with secure session cookies
- Profile management with style preferences and body metrics
- Wardrobe catalog with local image uploads, AI-assisted tagging, and item delete actions
- AI-assisted outfit generation using wardrobe inventory and weather insights (mock services)
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
- File uploads use the pluggable storage helper in `lib/storage/storage.ts`; the default `local` driver stores wardrobe images under `public/uploads/`. These files are git-ignored but served statically during development, so migrate to a cloud-backed driver before production.
