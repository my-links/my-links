import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

/** Bumped by an admin's flush action, embed it in every `/favicon` URL so browsers drop what they cached before the flush. */
export const useFaviconEpoch = (): number =>
	usePage<PageProps & { faviconEpoch: number }>().props.faviconEpoch;
