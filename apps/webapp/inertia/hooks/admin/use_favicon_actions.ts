import { router } from '@inertiajs/react';

import { urlFor } from '~/lib/tuyau';

interface UseFaviconActionsReturn {
	purgeOrphans: () => void;
	flushAll: () => void;
	reResolveFailures: () => void;
	reResolveAll: () => void;
}

/** The four global maintenance actions on the favicon store — none of them target a specific origin. */
export function useFaviconActions(): UseFaviconActionsReturn {
	const purgeOrphans = () =>
		router.post(
			urlFor('admin.favicons.purge-orphans'),
			{},
			{ preserveScroll: true }
		);

	const flushAll = () =>
		router.post(urlFor('admin.favicons.flush'), {}, { preserveScroll: true });

	const reResolveFailures = () =>
		router.post(
			urlFor('admin.favicons.reresolve-failures'),
			{},
			{ preserveScroll: true }
		);

	const reResolveAll = () =>
		router.post(
			urlFor('admin.favicons.reresolve-all'),
			{},
			{ preserveScroll: true }
		);

	return { purgeOrphans, flushAll, reResolveFailures, reResolveAll };
}
