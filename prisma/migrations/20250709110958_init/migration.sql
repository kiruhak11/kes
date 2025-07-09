-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `extendedDescription` TEXT NULL,
    `price` DECIMAL(65, 30) NULL,
    `image` VARCHAR(191) NULL,
    `specs` JSON NULL,
    `category_id` VARCHAR(191) NULL,
    `additional_images` JSON NULL,
    `category_name` VARCHAR(191) NULL,
    `category_slug` VARCHAR(191) NULL,
    `delivery_set` TEXT NULL,
    `connection_scheme` TEXT NULL,
    `additional_requirements` TEXT NULL,
    `required_products` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NULL,
    `type_building` VARCHAR(191) NULL,
    `fuel_type` VARCHAR(191) NULL,
    `power_type` VARCHAR(191) NULL,
    `raw_text` TEXT NULL,
    `status` VARCHAR(191) NULL DEFAULT 'new',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(191) NULL,
    `last_active` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visits` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `visits_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `country_stats` (
    `country` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`country`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `browser_stats` (
    `browser` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`browser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
