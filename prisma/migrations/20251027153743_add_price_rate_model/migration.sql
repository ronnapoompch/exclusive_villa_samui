-- CreateTable
CREATE TABLE "price_rates" (
    "id" TEXT NOT NULL,
    "villaId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePerNight" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "minStay" INTEGER,
    "maxStay" INTEGER,
    "seasonName" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "externalId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_rates_villaId_idx" ON "price_rates"("villaId");

-- CreateIndex
CREATE INDEX "price_rates_startDate_endDate_idx" ON "price_rates"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "price_rates_active_idx" ON "price_rates"("active");

-- CreateIndex
CREATE INDEX "price_rates_source_idx" ON "price_rates"("source");

-- AddForeignKey
ALTER TABLE "price_rates" ADD CONSTRAINT "price_rates_villaId_fkey" FOREIGN KEY ("villaId") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
