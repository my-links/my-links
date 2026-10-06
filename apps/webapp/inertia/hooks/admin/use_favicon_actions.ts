import { router } from '@inertiajs/react';

import { urlFor } from '~/lib/tuyau';

type FaviconActionRoute = Parameters<typeof urlFor>[0];

type UseFaviconActionsReturn = {
	purgeOrphans: () => void;
	flushAll: () => void;
	reResolveFailures: () => void;
	reResolveAll: () => void;
};

const postAction = (routeName: FaviconActionRoute) => () =>
	router.post(urlFor(routeName), {}, { preserveScroll: true });

/** The four global maintenance actions on the favicon store, none of them target a specific origin. */
export function useFaviconActions(): UseFaviconActionsReturn {
	return {
		purgeOrphans: postAction('admin.favicons.purge-orphans'),
		flushAll: postAction('admin.favicons.flush'),
		reResolveFailures: postAction('admin.favicons.reresolve-failures'),
		reResolveAll: postAction('admin.favicons.reresolve-all'),
	};
}
