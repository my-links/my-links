import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { PageProps } from '@adonisjs/inertia/types';

export type UserAuth = {
	isAuthenticated: boolean;
	isAdmin: boolean;
	user: Data.User | undefined;
};

export const useAuth = () =>
	usePage<PageProps & { auth: UserAuth }>().props.auth;
