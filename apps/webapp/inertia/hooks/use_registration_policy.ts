import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

import { RegistrationPolicy } from '~/types/app';

export const useRegistrationPolicy = (): RegistrationPolicy =>
	usePage<PageProps & { registrationPolicy: RegistrationPolicy }>().props
		.registrationPolicy;
