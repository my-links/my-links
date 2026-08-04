import { router } from '@inertiajs/react';

import { urlFor } from '~/lib/tuyau';

export function useMoveLinkToCollection() {
	return (linkId: number, fromCollectionId: number, toCollectionId: number) => {
		router.put(
			urlFor('link.move-to-collection', { id: linkId }),
			{ fromCollectionId, toCollectionId },
			{ preserveScroll: true }
		);
	};
}
