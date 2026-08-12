import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

export type AuthProviders = {
	isCredentialsEnabled: boolean;
	isGoogleEnabled: boolean;
};

export const useAuthProviders = (): AuthProviders =>
	usePage<PageProps & { authProviders: AuthProviders }>().props.authProviders;
