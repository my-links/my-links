import type { Infer } from '@vinejs/vine/types';

import type User from '#models/user';
import type Collection from '#models/collection';
import type { RequestOrigin } from '#lib/request_origin';
import type { CollectionService } from '#services/collections/collection_service';
import { createCollectionValidator } from '#validators/collections/create_collection_validator';

type CreateCollectionActionInput = {
	payload: Infer<typeof createCollectionValidator>;
	userId: User['id'];
	origin: RequestOrigin;
};

export async function createCollectionAction(
	{ payload, userId, origin }: CreateCollectionActionInput,
	collectionService: CollectionService
): Promise<Collection> {
	return collectionService.createCollection(
		userId,
		{
			name: payload.name,
			description: payload.description,
			visibility: payload.visibility,
			icon: payload.icon ?? null,
		},
		origin
	);
}
