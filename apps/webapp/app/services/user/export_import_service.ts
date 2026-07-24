import db from '@adonisjs/lucid/services/db';

import Link from '#models/link';
import type User from '#models/user';
import Collection from '#models/collection';

type ExportData = {
	collections: Array<{
		name: string;
		description: string | null;
		visibility: string;
		icon: string | null;
	}>;
	links: Array<{
		name: string;
		description: string | null;
		url: string;
		favorite: boolean;
		// Indexes into `collections` above — a link can belong to several.
		collectionIndexes: number[];
	}>;
};

type ValidatedImportData = {
	collections: Array<{
		name: string;
		description?: string | null;
		visibility: string;
		icon?: string | null;
	}>;
	links?: Array<{
		name: string;
		description?: string | null;
		url: string;
		favorite: boolean;
		collectionIndexes: number[];
	}>;
};

export class ExportImportService {
	async exportUserData(userId: User['id']): Promise<ExportData> {
		const collections = await Collection.query()
			.where('author_id', userId)
			.preload('links', (linksQuery) => {
				linksQuery.preload('collections').orderBy('name', 'asc');
			})
			.orderBy('name', 'asc');

		const collectionIndexById = new Map(
			collections.map((collection, index) => [collection.id, index])
		);

		// A link can be nested under several collections above — dedupe by id
		// so it appears once in the export, with all its collectionIndexes.
		const linksById = new Map<number, Link>();
		for (const collection of collections) {
			for (const link of collection.links) {
				linksById.set(link.id, link);
			}
		}

		return {
			collections: collections.map((collection) => ({
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
				collectionIndexes: link.collections
					.map((collection) => collectionIndexById.get(collection.id))
					.filter((index): index is number => index !== undefined),
			})),
		};
	}

	importUserData(userId: User['id'], validatedData: ValidatedImportData) {
		return db.transaction(async (transaction) => {
			const createdCollections = await Collection.createMany(
				validatedData.collections.map((collectionData) => ({
					name: collectionData.name,
					description: collectionData.description ?? null,
					visibility: collectionData.visibility as any,
					icon: collectionData.icon ?? null,
					authorId: userId,
				})),
				{ client: transaction }
			);

			for (const linkData of validatedData.links ?? []) {
				const link = await Link.create(
					{
						name: linkData.name,
						description: linkData.description ?? null,
						url: linkData.url,
						favorite: linkData.favorite,
						authorId: userId,
					},
					{ client: transaction }
				);

				const collectionIds = linkData.collectionIndexes
					.map((index) => createdCollections[index]?.id)
					.filter((id): id is number => id !== undefined);

				if (collectionIds.length > 0) {
					await link.related('collections').attach(collectionIds, transaction);
				}
			}
		});
	}
}
