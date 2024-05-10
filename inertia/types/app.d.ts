import type Collection from '#models/collection';

type User = {
  id: string;
  email: string;
  name: string;
  nickName: string;
  avatarUrl: string;
  isAdmin: boolean;
  collections: Collection[];
};
