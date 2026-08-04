import { router } from '@inertiajs/react';

import { urlFor } from '~/lib/tuyau';

export function useAddLinkToCollection() {
	return (linkId: number, collectionId: number) => {
		router.post(
			urlFor('link.add-to-collection', { id: linkId }),
			{ collectionId },
			{ preserveScroll: true }
		);
	};
}
