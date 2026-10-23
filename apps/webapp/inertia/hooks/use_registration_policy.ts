import type { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

export type RegistrationPolicy = {
	isOpen: boolean;
};

export const useRegistrationPolicy = (): RegistrationPolicy =>
	usePage<PageProps & { registrationPolicy: RegistrationPolicy }>().props
		.registrationPolicy;
