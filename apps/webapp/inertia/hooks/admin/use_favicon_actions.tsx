import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { ConfirmModal } from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';

type FaviconActionRoute = Parameters<typeof urlFor>[0];

type UseFaviconActionsReturn = {
	purgeOrphans: () => void;
	reResolveFailures: () => void;
	handleFlushAll: () => void;
	handleReResolveAll: () => void;
};

const postAction = (routeName: FaviconActionRoute) => () =>
	router.post(urlFor(routeName), {}, { preserveScroll: true });

/** The global maintenance actions on the favicon store, none of them target a specific origin. */
export function useFaviconActions(): UseFaviconActionsReturn {
	const flushAll = postAction('admin.favicons.flush');
	const reResolveAll = postAction('admin.favicons.reresolve-all');

	const handleFlushAll = () => {
		void ConfirmModal.call({
			title: <Trans>Flush the favicon store</Trans>,
			children: (
				<Trans>
					Every stored favicon is deleted. Links show a monogram until their
					icon is re-scraped on next view. Nothing is lost permanently, but
					every domain gets re-fetched again.
				</Trans>
			),
			confirmLabel: <Trans>Flush</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'danger',
			onConfirm: flushAll,
		});
	};

	const handleReResolveAll = () => {
		void ConfirmModal.call({
			title: <Trans>Re-resolve every favicon</Trans>,
			children: (
				<Trans>
					Every known domain is re-scraped in place. Links keep their current
					icon until a fresher one actually lands. Can take a while on a large
					store.
				</Trans>
			),
			confirmLabel: <Trans>Re-resolve all</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			onConfirm: reResolveAll,
		});
	};

	return {
		purgeOrphans: postAction('admin.favicons.purge-orphans'),
		reResolveFailures: postAction('admin.favicons.reresolve-failures'),
		handleFlushAll,
		handleReResolveAll,
	};
}
