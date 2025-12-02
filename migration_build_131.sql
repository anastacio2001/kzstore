-- Migration: Add Shipping Zones, Newsletter, Cart Sync, ERP Webhooks
-- Build 131: Advanced E-commerce Features

-- SELECT DATABASE
USE `kzstore_prod`;

-- 1. SHIPPING ZONES TABLE
CREATE TABLE IF NOT EXISTS `ShippingZone` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `province` VARCHAR(191) NOT NULL,
  `municipalities` JSON NULL,
  `cost` DECIMAL(10,2) NOT NULL DEFAULT 3500.00,
  `estimated_days` INT NOT NULL DEFAULT 3,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_shipping_province` (`province`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS `NewsletterSubscriber` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(191) NULL,
  `status` ENUM('active', 'unsubscribed', 'bounced') NOT NULL DEFAULT 'active',
  `subscribed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `unsubscribed_at` DATETIME(3) NULL,
  `source` VARCHAR(100) NULL COMMENT 'checkout, footer, popup, etc',
  INDEX `idx_newsletter_email` (`email`),
  INDEX `idx_newsletter_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. EMAIL CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS `EmailCampaign` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(300) NOT NULL,
  `content_html` TEXT NOT NULL,
  `content_text` TEXT NULL,
  `status` ENUM('draft', 'scheduled', 'sent', 'cancelled') NOT NULL DEFAULT 'draft',
  `scheduled_at` DATETIME(3) NULL,
  `sent_at` DATETIME(3) NULL,
  `recipients_count` INT NOT NULL DEFAULT 0,
  `opened_count` INT NOT NULL DEFAULT 0,
  `clicked_count` INT NOT NULL DEFAULT 0,
  `created_by` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_campaign_status` (`status`),
  INDEX `idx_campaign_scheduled` (`scheduled_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CART SYNC TABLE (Cloud Cart)
CREATE TABLE IF NOT EXISTS `Cart` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(191) NULL,
  `session_id` VARCHAR(191) NULL COMMENT 'For guest users',
  `items` JSON NOT NULL,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `expires_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_cart_user` (`user_id`),
  INDEX `idx_cart_session` (`session_id`),
  INDEX `idx_cart_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PUSH SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS `PushSubscription` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(191) NULL,
  `endpoint` TEXT NOT NULL,
  `keys_auth` TEXT NOT NULL,
  `keys_p256dh` TEXT NOT NULL,
  `user_agent` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_push_user` (`user_id`),
  INDEX `idx_push_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ERP WEBHOOKS TABLE
CREATE TABLE IF NOT EXISTS `WebhookEvent` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `event_type` VARCHAR(100) NOT NULL COMMENT 'stock.updated, order.created, etc',
  `payload` JSON NOT NULL,
  `source` VARCHAR(100) NOT NULL COMMENT 'ERP system name',
  `status` ENUM('pending', 'processed', 'failed') NOT NULL DEFAULT 'pending',
  `error_message` TEXT NULL,
  `processed_at` DATETIME(3) NULL,
  `retry_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `idx_webhook_type` (`event_type`),
  INDEX `idx_webhook_status` (`status`),
  INDEX `idx_webhook_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ADD PROVINCE FIELD TO PRODUCT (for shipping calculation)
ALTER TABLE `Product` 
ADD COLUMN `requires_special_shipping` BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN `shipping_class` VARCHAR(50) NULL COMMENT 'standard, express, heavy, fragile';

-- 8. INSERT DEFAULT SHIPPING ZONES (Angola Provinces)
INSERT IGNORE INTO `ShippingZone` (`id`, `name`, `province`, `cost`, `estimated_days`) VALUES
('zone-luanda', 'Luanda', 'Luanda', 3500.00, 2),
('zone-benguela', 'Benguela', 'Benguela', 5000.00, 5),
('zone-huambo', 'Huambo', 'Huambo', 5500.00, 6),
('zone-huila', 'Huíla', 'Huíla', 6000.00, 7),
('zone-namibe', 'Namibe', 'Namibe', 6500.00, 7),
('zone-cabinda', 'Cabinda', 'Cabinda', 7000.00, 8),
('zone-zaire', 'Zaire', 'Zaire', 6000.00, 7),
('zone-uige', 'Uíge', 'Uíge', 5500.00, 6),
('zone-malanje', 'Malanje', 'Malanje', 5500.00, 6),
('zone-lunda-norte', 'Lunda Norte', 'Lunda Norte', 7500.00, 10),
('zone-lunda-sul', 'Lunda Sul', 'Lunda Sul', 7500.00, 10),
('zone-moxico', 'Moxico', 'Moxico', 7000.00, 9),
('zone-cuando-cubango', 'Cuando Cubango', 'Cuando Cubango', 8000.00, 10),
('zone-cunene', 'Cunene', 'Cunene', 7000.00, 8),
('zone-bie', 'Bié', 'Bié', 6000.00, 7),
('zone-cuanza-norte', 'Cuanza Norte', 'Cuanza Norte', 4500.00, 4),
('zone-cuanza-sul', 'Cuanza Sul', 'Cuanza Sul', 5000.00, 5),
('zone-bengo', 'Bengo', 'Bengo', 4000.00, 3);
