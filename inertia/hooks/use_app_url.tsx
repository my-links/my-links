import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

export function useAppUrl() {
	const { props } = usePage<PageProps & { appUrl: string }>();
	return props.appUrl;
}
