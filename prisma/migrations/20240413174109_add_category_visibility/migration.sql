-- AlterTable
ALTER TABLE `category` ADD COLUMN `visibility` ENUM('private', 'public') NOT NULL DEFAULT 'private';
