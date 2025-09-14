-- CreateTable
CREATE TABLE `CheckoutEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `shopDomain` VARCHAR(191) NOT NULL,
    `checkoutId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `raw` JSON NOT NULL,

    INDEX `CheckoutEvent_tenantId_occurredAt_idx`(`tenantId`, `occurredAt`),
    UNIQUE INDEX `CheckoutEvent_tenantId_checkoutId_status_key`(`tenantId`, `checkoutId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `shopDomain` VARCHAR(191) NOT NULL,
    `cartToken` VARCHAR(191) NOT NULL,
    `event` VARCHAR(191) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `raw` JSON NOT NULL,

    INDEX `CartEvent_tenantId_occurredAt_idx`(`tenantId`, `occurredAt`),
    UNIQUE INDEX `CartEvent_tenantId_cartToken_event_key`(`tenantId`, `cartToken`, `event`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CheckoutEvent` ADD CONSTRAINT `CheckoutEvent_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartEvent` ADD CONSTRAINT `CartEvent_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
