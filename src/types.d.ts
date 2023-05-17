export interface Category {
  id: number;
  name: string;

  links: Link[];
  nextCategoryId: number;

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
  };

  nextLinkId: number;
  favorite: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface SearchItem {
  id: number;
  name: string;
  url: string;
  type: "category" | "link";
  category?: undefined | Link["category"];
}
