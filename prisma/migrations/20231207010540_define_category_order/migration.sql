UPDATE category c
JOIN (
    SELECT 
        id,
        authorId,
        ROW_NUMBER() OVER (PARTITION BY authorId ORDER BY createdAt) - 1 AS new_order
    FROM category
) numbered_categories
ON c.id = numbered_categories.id
SET c.order = numbered_categories.new_order;