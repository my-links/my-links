import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import LinkTransformer from '#transformers/link';
import { SyncService } from '#services/sync/sync_service';
import CollectionTransformer from '#transformers/collection';
import { parseSyncCursor } from '#validators/sync/sync_cursor';
import { syncDeltaValidator } from '#validators/sync/sync_delta_validator';

@inject()
export default class SyncController {
	constructor(protected readonly syncService: SyncService) {}

	async render({ request, auth, response, serialize }: HttpContext) {
		const { since } = await request.validateUsing(syncDeltaValidator);

		const delta = await this.syncService.getDelta(
			auth.getUserOrFail().id,
			parseSyncCursor(since)
		);

		const { data: collections } = await serialize(
			CollectionTransformer.transform(delta.collections)
		);
		const { data: links } = await serialize(
			LinkTransformer.transform(delta.links).useVariant('withCollections')
		);

		return response.json({
			// Same ISO format the transformers emit for `createdAt`/`updatedAt`,
			// so a client can compare timestamps without reformatting anything.
			syncedAt: delta.syncedAt.toString(),
			isFullSync: delta.isFullSync,
			collections,
			links,
			deletedCollectionIds: delta.deletedCollectionIds,
			deletedLinkIds: delta.deletedLinkIds,
		});
	}
}
