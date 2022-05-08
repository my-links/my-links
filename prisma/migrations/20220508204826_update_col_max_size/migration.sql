-- AlterTable
ALTER TABLE `category` MODIFY `name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `link` MODIFY `name` VARCHAR(255) NOT NULL,
    MODIFY `url` TEXT NOT NULL;
