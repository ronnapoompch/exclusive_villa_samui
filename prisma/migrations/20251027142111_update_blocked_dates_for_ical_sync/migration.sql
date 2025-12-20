/*
  Warnings:

  - You are about to drop the column `date` on the `blocked_dates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[villaId,externalId,source]` on the table `blocked_dates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `blocked_dates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `blocked_dates` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add new columns with temporary defaults
ALTER TABLE "blocked_dates" 
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "externalId" TEXT;

-- Step 2: Migrate existing data (date -> startDate, endDate = startDate + 1 day)
UPDATE "blocked_dates" 
SET "startDate" = "date",
    "endDate" = "date" + INTERVAL '1 day'
WHERE "startDate" IS NULL;

-- Step 3: Make columns required (NOT NULL)
ALTER TABLE "blocked_dates" 
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL;

-- Step 4: Drop old index and column
DROP INDEX "blocked_dates_date_idx";
DROP INDEX "blocked_dates_villaId_date_source_key";
ALTER TABLE "blocked_dates" DROP COLUMN "date";

-- Step 5: Create new indexes
CREATE INDEX "blocked_dates_startDate_idx" ON "blocked_dates"("startDate");
CREATE INDEX "blocked_dates_endDate_idx" ON "blocked_dates"("endDate");
CREATE UNIQUE INDEX "blocked_dates_villaId_externalId_source_key" ON "blocked_dates"("villaId", "externalId", "source");
