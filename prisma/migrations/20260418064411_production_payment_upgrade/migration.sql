/*
  Warnings:

  - A unique constraint covering the columns `[razorpayOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `paymentCaptured` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `Order_razorpayOrderId_key` ON `Order`(`razorpayOrderId`);

-- CreateIndex
CREATE INDEX `Order_razorpayOrderId_idx` ON `Order`(`razorpayOrderId`);

-- RenameIndex
ALTER TABLE `order` RENAME INDEX `Order_userId_fkey` TO `Order_userId_idx`;
