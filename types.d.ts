export interface Category {
    id: number;
    name: string;

    links: Link[];
    order: number;

    createdAt: Date;
    updatedAt: Date;
}

export interface Link {
    id: number;

    name: string;
    url: string;

    category: {
        id: number;
        name: string;
    }

    order: number;
    favorite: boolean;

    createdAt: Date;
    updatedAt: Date;
}