import { UserAuth } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

export const useAuth = () =>
	usePage<PageProps & { auth: UserAuth }>().props.auth;
