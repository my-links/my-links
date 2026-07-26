import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@adonisjs/inertia/types';

export function useFlashMessages() {
	return usePage<SharedProps>().props.flash;
}
