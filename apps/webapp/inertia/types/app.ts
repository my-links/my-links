import type { Data } from '@generated/data';

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

export type UserAuth = {
	isAuthenticated: boolean;
	isAdmin: boolean;
	user: Data.User | undefined;
};
