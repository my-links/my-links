DELIMITER $$

CREATE PROCEDURE update_category_order(
    IN old_order INT,
    IN new_order INT,
    IN author_id INT
)
BEGIN
    -- Décrémenter l'ordre des catégories qui viennent après l'ancien ordre
    UPDATE category
    SET `order` = `order` - 1
    WHERE authorId = author_id AND `order` > old_order;

    -- Incrémenter l'ordre des catégories qui viennent après le nouvel ordre
    UPDATE category
    SET `order` = `order` + 1
    WHERE authorId = author_id AND `order` >= new_order;
END $$

DELIMITER ;
