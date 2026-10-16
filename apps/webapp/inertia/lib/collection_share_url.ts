import { urlFor } from '~/lib/tuyau';

export const buildCollectionShareUrl = (collectionId: number): string =>
	`${window.location.origin}${urlFor('shared', { id: collectionId })}`;
