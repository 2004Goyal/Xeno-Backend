/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,shopifyId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Order_shopifyId_key` ON `Order`;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `shopifyId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `lineTotal` DECIMAL(10, 2) NOT NULL,

    INDEX `OrderItem_tenantId_orderId_idx`(`tenantId`, `orderId`),
    UNIQUE INDEX `OrderItem_tenantId_shopifyId_key`(`tenantId`, `shopifyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Order_tenantId_shopifyId_key` ON `Order`(`tenantId`, `shopifyId`);

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
