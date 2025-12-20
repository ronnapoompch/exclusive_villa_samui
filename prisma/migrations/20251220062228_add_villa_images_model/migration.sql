-- CreateTable
CREATE TABLE "villa_images" (
    "id" TEXT NOT NULL,
    "villaId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "format" TEXT DEFAULT 'webp',
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villa_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "villa_images_villaId_idx" ON "villa_images"("villaId");

-- CreateIndex
CREATE INDEX "villa_images_category_idx" ON "villa_images"("category");

-- CreateIndex
CREATE INDEX "villa_images_isHero_idx" ON "villa_images"("isHero");

-- CreateIndex
CREATE INDEX "villa_images_order_idx" ON "villa_images"("order");

-- AddForeignKey
ALTER TABLE "villa_images" ADD CONSTRAINT "villa_images_villaId_fkey" FOREIGN KEY ("villaId") REFERENCES "villas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
