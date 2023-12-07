-- TODO: Fix migration

DELIMITER $$

CREATE TRIGGER ORDER_INSERT BEFORE INSERT ON CATEGORY
FOR EACH ROW BEGIN SET
	SET
	SET @total_user_categories = (
	        SELECT COUNT(id)
	        FROM category
	        WHERE
	            authorId = NEW.authorId
	    );
	SET NEW.order = @total_user_categories + 1;
	END $$


DELIMITER;
