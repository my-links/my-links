import { DisplayPreferences } from '#shared/types/index';

type CommonBase = {
	id: number;
	createdAt: string;
	updatedAt: string;
};

export type User = CommonBase & {
	email: string;
	fullname: string;
	avatarUrl: string;
	isAdmin: boolean;
	lastSeenAt: string;
	displayPreferences: DisplayPreferences;
};

export type PublicUser = Omit<User, 'email'>;

export type Users = User[];

export type UserWithCollections = User & {
	collections: Collection[];
};

export type UserWithRelationCount = CommonBase & {
	email: string;
	fullname: string;
	avatarUrl: string;
	isAdmin: string;
	linksCount: number;
	collectionsCount: number;
	lastSeenAt: string;
};

export type Link = CommonBase & {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	collectionId: number;
};

export type LinkWithCollection = Link & {
	collection: Collection;
};

export type PublicLink = Omit<Link, 'favorite'>;
export type PublicLinkWithCollection = Omit<Link, 'favorite'>;

export type Collection = CommonBase & {
	name: string;
	description: string | null;
	visibility: Visibility;
	authorId: number;
};

export type CollectionWithLinks = Collection & {
	links: Link[];
};

export enum Visibility {
	PUBLIC = 'PUBLIC',
	PRIVATE = 'PRIVATE',
}

export type ApiToken = {
	identifier: number;
	token: string | undefined;
	name: string | null;
	type: 'bearer';
	lastUsedAt: string | null;
	expiresAt: string | null;
	abilities: string[];
};
