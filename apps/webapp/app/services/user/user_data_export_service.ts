import { inject } from '@adonisjs/core';
import { randomUUID } from 'node:crypto';

import type Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import type { RequestOrigin } from '#lib/request_origin';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { ActivityEventService } from '#services/activity/activity_event_service';

type ExportLink = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	// Keys into `collections` above: a link can belong to several.
	collectionKeys: string[];
};

type ExportData = {
	collections: Array<{
		// Random per-export identifier, unrelated to the real DB id: lets a
		// hand-edited file drop a collection without shifting every other
		// link's references (see git history for the index-based bug this
		// replaced).
		key: string;
		name: string;
		description: string | null;
		visibility: string;
		icon: string | null;
	}>;
	links: Array<ExportLink>;
};

@inject()
export class UserDataExportService {
	constructor(protected readonly activityEventService: ActivityEventService) {}

	async exportUserData(
		userId: User['id'],
		origin: RequestOrigin
	): Promise<ExportData> {
		const collections = await Collection.query()
			.where('author_id', userId)
			.preload('links', (linksQuery) => {
				linksQuery.preload('collections').orderBy('name', 'asc');
			})
			.orderBy('name', 'asc');

		const exportKeys: string[] = collections.map(() => randomUUID());
		const exportKeyById = new Map<number, string>(
			collections.map((collection, index) => [collection.id, exportKeys[index]])
		);

		// A link can be nested under several collections above; dedupe by id
		// so it appears once in the export, with all its collectionKeys.
		const linksById = new Map<number, Link>();
		for (const collection of collections) {
			for (const link of collection.links) {
				linksById.set(link.id, link);
			}
		}

		await this.activityEventService.record({
			type: ACTIVITY_EVENT_TYPE.DATA_EXPORTED,
			userId,
			origin,
			subjectType: AUDIT_SUBJECT_TYPE.ACCOUNT,
			subjectId: userId,
		});

		return {
			collections: collections.map((collection, index) => ({
				key: exportKeys[index],
				name: collection.name,
				description: collection.description,
				visibility: collection.visibility,
				icon: collection.icon,
			})),
			links: [...linksById.values()].map((link) => ({
				name: link.name,
				description: link.description,
				url: link.url,
				favorite: link.favorite,
				collectionKeys: link.collections
					.map((collection) => exportKeyById.get(collection.id))
					.filter((key): key is string => key !== undefined),
			})),
		};
	}
}
