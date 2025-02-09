-- CreateEnum
CREATE TYPE "BulkRequestStatus" AS ENUM ('PENDING', 'RESPONDED', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BulkResponseStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "BulkPurchaseRequest" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "requirements" TEXT,
    "status" "BulkRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkPurchaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkPurchaseResponse" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "customPrice" DOUBLE PRECISION NOT NULL,
    "estimatedDelivery" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "BulkResponseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkPurchaseResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkPurchaseRequest_buyerId_idx" ON "BulkPurchaseRequest"("buyerId");
CREATE INDEX "BulkPurchaseRequest_sellerId_idx" ON "BulkPurchaseRequest"("sellerId");
CREATE INDEX "BulkPurchaseRequest_productId_idx" ON "BulkPurchaseRequest"("productId");
CREATE INDEX "BulkPurchaseRequest_status_idx" ON "BulkPurchaseRequest"("status");

-- CreateIndex
CREATE INDEX "BulkPurchaseResponse_requestId_idx" ON "BulkPurchaseResponse"("requestId");
CREATE INDEX "BulkPurchaseResponse_sellerId_idx" ON "BulkPurchaseResponse"("sellerId");
CREATE INDEX "BulkPurchaseResponse_status_idx" ON "BulkPurchaseResponse"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "BulkPurchaseRequest" ADD CONSTRAINT "BulkPurchaseRequest_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BulkPurchaseRequest" ADD CONSTRAINT "BulkPurchaseRequest_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BulkPurchaseRequest" ADD CONSTRAINT "BulkPurchaseRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkPurchaseResponse" ADD CONSTRAINT "BulkPurchaseResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BulkPurchaseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BulkPurchaseResponse" ADD CONSTRAINT "BulkPurchaseResponse_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
