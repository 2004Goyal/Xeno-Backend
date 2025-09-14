/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,shopifyId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,shopifyId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Customer_shopifyId_key` ON `Customer`;

-- DropIndex
DROP INDEX `Product_shopifyId_key` ON `Product`;

-- CreateIndex
CREATE UNIQUE INDEX `Customer_tenantId_shopifyId_key` ON `Customer`(`tenantId`, `shopifyId`);

-- CreateIndex
CREATE UNIQUE INDEX `Product_tenantId_shopifyId_key` ON `Product`(`tenantId`, `shopifyId`);
