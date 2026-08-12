import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

export type PasswordRecovery = {
	isEnabled: boolean;
};

export const usePasswordRecovery = (): PasswordRecovery =>
	usePage<PageProps & { passwordRecovery: PasswordRecovery }>().props
		.passwordRecovery;
