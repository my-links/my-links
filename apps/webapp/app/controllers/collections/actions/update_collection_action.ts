import type { Infer } from '@vinejs/vine/types';

import type User from '#models/user';
import type { RequestOrigin } from '#lib/request_origin';
import type { CollectionService } from '#services/collections/collection_service';
import { updateCollectionValidator } from '#validators/collections/update_collection_validator';

type UpdateCollectionActionInput = {
	payload: Infer<typeof updateCollectionValidator>;
	userId: User['id'];
	origin: RequestOrigin;
};

export async function updateCollectionAction(
	{ payload, userId, origin }: UpdateCollectionActionInput,
	collectionService: CollectionService
): Promise<void> {
	const {
		params: { id: collectionId },
		...collectionFields
	} = payload;

	await collectionService.updateCollection(
		userId,
		collectionId,
		{
			name: collectionFields.name,
			description: collectionFields.description,
			visibility: collectionFields.visibility,
			icon: collectionFields.icon ?? null,
		},
		origin
	);
}
