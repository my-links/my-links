import { Category, Link } from "../types"

export function BuildCategory({ id, name, order, links = [], createdAt, updatedAt }): Category {
    return {
        id,
        name,
        links: links.map((link) => BuildLink(link, { categoryId: id, categoryName: name })),
        order,
        createdAt,
        updatedAt
    }
}

export function BuildLink({ id, name, url, order, favorite, createdAt, updatedAt }, { categoryId, categoryName }): Link {
    return {
        id,
        name,
        url,
        category: {
            id: categoryId,
            name: categoryName
        },
        order,
        favorite,
        createdAt,
        updatedAt
    }
}