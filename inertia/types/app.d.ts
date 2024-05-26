import { Visibility } from '@/app/enums/visibility';

type CommonBase = {
  id: number;
  createdAt: string;
  updatedAt: string;
};

type User = CommonBase & {
  email: string;
  name: string;
  nickName: string;
  fullname: string;
  avatarUrl: string;
  isAdmin: boolean;
};

type UserWithCollections = User & {
  collections: Collection[];
};

type UserWithRelationCount = CommonBase & {
  email: string;
  fullname: string;
  avatarUrl: string;
  isAdmin: string;
  count: {
    link: number;
    collection: number;
  };
};

type Link = CommonBase & {
  name: string;
  description: string | null;
  url: string;
  favorite: boolean;
  collectionId: number;
};

type LinkWithCollection = Link & {
  collection: Collection;
};

type Collection = CommonBase & {
  name: string;
  description: string | null;
  visibility: Visibility;
  nextId: number;
  authorId: number;
};

type CollectionWithLinks = Collection & {
  links: Link[];
};
