/*
  Warnings:

  - You are about to drop the column `nextCategoryId` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `nextLinkId` on the `link` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `category` DROP COLUMN `nextCategoryId`,
    ADD COLUMN `authorId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `link` DROP COLUMN `nextLinkId`;

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `category_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
