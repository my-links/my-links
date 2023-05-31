import { User } from "@prisma/client";

export interface Category {
  id: number;
  name: string;

  links: Link[];
  authorId: User["id"];
  author: User;

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

  authorId: User["id"];
  author: User;
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
