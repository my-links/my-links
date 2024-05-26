import type Collection from '#models/collection';

type User = {
  id: number;
  email: string;
  name: string;
  nickName: string;
  fullname: string;
  avatarUrl: string;
  isAdmin: boolean;
  collections: Collection[];
};

type UserWithRelationCount = {
  id: number;
  email: string;
  fullname: string;
  avatarUrl: string;
  isAdmin: string;
  createdAt: string;
  updatedAt: string;
  count: {
    link: number;
    collection: number;
  };
};
