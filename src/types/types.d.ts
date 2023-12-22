import { Category, User } from '@prisma/client';
import { Profile } from 'next-auth';

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

export interface GoogleProfile extends Profile {
  iss: string;
  azp: string;
  aud: string;
  email_verified: boolean;
  at_hash: string;
  picture: string;
  given_name: string;
  locale: string;
  iat: number;
  exp: number;
}
