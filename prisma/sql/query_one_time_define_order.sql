-- To execute one time, after migration to apply default order to every categories

UPDATE category c
JOIN (
    SELECT
        id,
        authorId,
        ROW_NUMBER() OVER (PARTITION BY authorId ORDER BY createdAt) AS new_order
    FROM category
) numbered_categories
ON c.id = numbered_categories.id
SET c.order = numbered_categories.new_order;
