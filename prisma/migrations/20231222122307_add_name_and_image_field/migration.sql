-- AlterTable
ALTER TABLE `user` ADD COLUMN `name` VARCHAR(191) NULL AFTER `email`,
  ADD COLUMN `image` VARCHAR(191) NULL AFTER `name`;
