import type { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

export type AuthProviders = {
	isCredentialsEnabled: boolean;
	isGoogleEnabled: boolean;
};

export const useAuthProviders = (): AuthProviders =>
	usePage<PageProps & { authProviders: AuthProviders }>().props.authProviders;
