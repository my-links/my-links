import type { PageProps } from '@adonisjs/inertia/types';
import type { Data } from '@generated/data';
import { usePage } from '@inertiajs/react';

export type UserAuth = {
	isAuthenticated: boolean;
	isAdmin: boolean;
	user: Data.User.Variants['forSession'] | undefined;
};

export const useAuth = () =>
	usePage<PageProps & { auth: UserAuth }>().props.auth;
