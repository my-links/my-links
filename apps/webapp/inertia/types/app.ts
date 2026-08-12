import type { Data } from '@generated/data';

export type ApiToken = {
	identifier: number;
	token: string | undefined;
	name: string | null;
	type: 'bearer';
	createdAt: string | null;
	lastUsedAt: string | null;
	expiresAt: string | null;
	abilities: string[];
};

export type UserAuth = {
	isAuthenticated: boolean;
	isAdmin: boolean;
	user: Data.User | undefined;
};

export type AuthProviders = {
	isCredentialsEnabled: boolean;
	isGoogleEnabled: boolean;
};

export type RegistrationPolicy = {
	isOpen: boolean;
};

export type PasswordRecovery = {
	isEnabled: boolean;
};
