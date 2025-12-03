-- CreateEnum
CREATE TYPE "ClothCategory" AS ENUM ('TOP', 'BOTTOM', 'DRESS', 'OUTERWEAR', 'SHOES', 'SOCKS', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "ClothSeason" AS ENUM ('SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASONS');

-- CreateEnum
CREATE TYPE "ClothFormality" AS ENUM ('CASUAL', 'OFFICE', 'SPORT', 'SPECIAL');

-- CreateEnum
CREATE TYPE "OutfitScenario" AS ENUM ('DAILY', 'OFFICE', 'TRAVEL', 'SPECIAL');

-- CreateEnum
CREATE TYPE "OutfitItemRole" AS ENUM ('TOP', 'BOTTOM', 'SHOES', 'OUTERWEAR', 'DRESS', 'SOCKS', 'ACCESSORY', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageRange" TEXT,
    "gender" TEXT,
    "stylePreferences" TEXT[],
    "locationCity" TEXT,
    "customModelPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "selectedModelType" TEXT,
    "selectedModelIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClothItem" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" "ClothCategory" NOT NULL,
    "color" TEXT NOT NULL,
    "material" TEXT,
    "season" "ClothSeason" NOT NULL,
    "formality" "ClothFormality" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClothItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outfit" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "scenario" "OutfitScenario" NOT NULL,
    "notes" TEXT,
    "weatherSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutfitItem" (
    "id" TEXT NOT NULL,
    "outfitId" TEXT NOT NULL,
    "clothItemId" TEXT NOT NULL,
    "role" "OutfitItemRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "ClothItem_profileId_idx" ON "ClothItem"("profileId");

-- CreateIndex
CREATE INDEX "Outfit_profileId_date_idx" ON "Outfit"("profileId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Outfit_profileId_date_scenario_key" ON "Outfit"("profileId", "date", "scenario");

-- CreateIndex
CREATE INDEX "OutfitItem_outfitId_idx" ON "OutfitItem"("outfitId");

-- CreateIndex
CREATE INDEX "OutfitItem_clothItemId_idx" ON "OutfitItem"("clothItemId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClothItem" ADD CONSTRAINT "ClothItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outfit" ADD CONSTRAINT "Outfit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_outfitId_fkey" FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem" ADD CONSTRAINT "OutfitItem_clothItemId_fkey" FOREIGN KEY ("clothItemId") REFERENCES "ClothItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
