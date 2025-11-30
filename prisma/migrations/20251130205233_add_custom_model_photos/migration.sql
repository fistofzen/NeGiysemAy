/*
  Warnings:

  - You are about to drop the column `selectedModelIndex` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `selectedModelType` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "selectedModelIndex",
DROP COLUMN "selectedModelType";
