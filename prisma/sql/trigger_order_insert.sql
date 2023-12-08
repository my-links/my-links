DELIMITER $$

CREATE TRIGGER ORDER_INSERT BEFORE INSERT ON category
FOR EACH ROW
BEGIN
    SET @total_user_categories = (
        SELECT COUNT(id)
        FROM category
        WHERE authorId = NEW.authorId
    );
    SET NEW.order = @total_user_categories + 1;
END $$

DELIMITER ;
