import axios from 'axios';
import { Category, Link } from '../types';

export function BuildCategory({ id, name, nextCategoryId, links = [], createdAt, updatedAt }): Category {
    return {
        id,
        name,
        links: links.map((link) => BuildLink(link, { categoryId: id, categoryName: name })),
        nextCategoryId,
        createdAt,
        updatedAt
    }
}

export function BuildLink({ id, name, url, nextLinkId, favorite, createdAt, updatedAt }, { categoryId, categoryName }): Link {
    return {
        id,
        name,
        url,
        category: {
            id: categoryId,
            name: categoryName
        },
        nextLinkId,
        favorite,
        createdAt,
        updatedAt
    }
}

export function IsValidURL(url: string): boolean {
    const regex = new RegExp(/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.\%]+$/);
    return url.match(regex) ? true : false;
}

export function HandleAxiosError(error): string {
    let errorText: string;

    if (axios.isAxiosError(error)) {
        if (error.response) {
            const responseError = error.response.data?.['error'] || error.response.data;
            errorText = responseError || 'Une erreur est survenue';
        } else if (error.request) {
            errorText = 'Aucune donnée renvoyée par le serveur';
        } else {
            errorText = 'Une erreur inconnue est survenue';
        }
    } else {
        errorText = 'Une erreur est survenue';
    }

    console.error(error);
    return errorText;
}