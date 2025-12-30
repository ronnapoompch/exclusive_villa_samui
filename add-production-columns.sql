-- Add monthly pricing columns to production database
ALTER TABLE "villas" 
ADD COLUMN IF NOT EXISTS "codeId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "isMonthlyRate" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "monthlyPriceText" TEXT;

-- Create index on codeId for faster lookups
CREATE INDEX IF NOT EXISTS "villas_codeId_idx" ON "villas"("codeId");
