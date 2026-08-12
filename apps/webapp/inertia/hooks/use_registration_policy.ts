import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

export type RegistrationPolicy = {
	isOpen: boolean;
};

export const useRegistrationPolicy = (): RegistrationPolicy =>
	usePage<PageProps & { registrationPolicy: RegistrationPolicy }>().props
		.registrationPolicy;
