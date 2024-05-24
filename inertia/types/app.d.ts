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
