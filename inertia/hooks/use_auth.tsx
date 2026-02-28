import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { UserAuth } from '~/types/app';

export const useAuth = () =>
	usePage<PageProps & { auth: UserAuth }>().props.auth;
