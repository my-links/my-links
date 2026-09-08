import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

/** Bumped by an admin's "flush store" action — embed it in every `/favicon` URL so a browser stops serving what it cached before the flush. */
export const useFaviconEpoch = (): number =>
	usePage<PageProps & { faviconEpoch: number }>().props.faviconEpoch;
