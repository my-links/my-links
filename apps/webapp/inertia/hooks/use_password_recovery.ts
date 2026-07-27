import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

import { PasswordRecovery } from '~/types/app';

export const usePasswordRecovery = (): PasswordRecovery =>
	usePage<PageProps & { passwordRecovery: PasswordRecovery }>().props
		.passwordRecovery;
