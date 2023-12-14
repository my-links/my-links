-- set default next id for each category based on LEAD(id) (LEAD -> Next)

UPDATE category AS c
JOIN (
    SELECT
        id,
        LEAD(id) OVER (PARTITION BY authorId ORDER BY id) AS nextCategoryId
    FROM category
) AS n ON c.id = n.id
SET c.nextId = n.nextCategoryId;
