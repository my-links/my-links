import type { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

export type PasswordRecovery = {
	isEnabled: boolean;
};

export const usePasswordRecovery = (): PasswordRecovery =>
	usePage<PageProps & { passwordRecovery: PasswordRecovery }>().props
		.passwordRecovery;
