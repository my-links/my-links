import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

import { AuthProviders } from '~/types/app';

export const useAuthProviders = (): AuthProviders =>
	usePage<PageProps & { authProviders: AuthProviders }>().props.authProviders;
