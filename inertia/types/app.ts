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
