# Ne Giysem Ay

Production-ready MVP for a wardrobe management and AI-powered outfit suggestion platform built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Prisma.

## Features
- Email/password authentication with secure session cookies
- Profile management with style preferences and body metrics
- Wardrobe catalog with categories, seasons, formality, and image uploads (mocked)
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
- AI and weather services are mocked; replace implementations in `lib/ai/aiService.ts` and `lib/weather/weatherService.ts` for real integrations.
- File uploads in wardrobe API are stubbed; integrate with storage provider for production use.
