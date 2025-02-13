-- CreateTable
CREATE TABLE "BulkDiscount" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkDiscount_productId_idx" ON "BulkDiscount"("productId");

-- AddForeignKey
ALTER TABLE "BulkDiscount" ADD CONSTRAINT "BulkDiscount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
