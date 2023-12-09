import { Category, User } from '@prisma/client';

export type CategoryWithLinks = Category & {
  author: User;
  links: LinkWithCategory[];
};
export type LinkWithCategory = LinkWithCategory & {
  author: User;
  category: CategoryWithLinks;
};

export interface SearchItem {
  id: number;
  name: string;
  url: string;
  type: 'category' | 'link';
  category?: undefined | LinkWithCategory['category'];
}

export interface Favicon {
  buffer: Buffer;
  url: string;
  type: string;
  size: number;
}
