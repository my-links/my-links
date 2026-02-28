import Collection from '#models/collection';
import Link from '#models/link';
import type User from '#models/user';
import db from '@adonisjs/lucid/services/db';

type ExportData = {
	collections: Array<{
		name: string;
		description: string | null;
		visibility: string;
		icon: string | null;
		links: Array<{
			name: string;
			description: string | null;
			url: string;
			favorite: boolean;
		}>;
	}>;
};

type ValidatedImportData = {
	collections: Array<{
		name: string;
		description?: string | null;
		visibility: string;
		icon?: string | null;
		links?: Array<{
			name: string;
			description?: string | null;
			url: string;
			favorite: boolean;
		}>;
	}>;
};

export class ExportImportService {
	async exportUserData(userId: User['id']): Promise<ExportData> {
		const collections = await Collection.query()
			.where('author_id', userId)
			.preload('links', (q) => q.orderBy('name', 'asc'))
			.orderBy('name', 'asc');

		return {
			collections: collections.map((collection) => ({
				name: collection.name,
				description: collection.description,
				visibility: collection.visibility,
				icon: collection.icon,
				links: collection.links.map((link) => ({
					name: link.name,
					description: link.description,
					url: link.url,
					favorite: link.favorite,
				})),
			})),
		};
	}

	importUserData(userId: User['id'], validatedData: ValidatedImportData) {
		return db.transaction(async (transaction) => {
			for (const collectionData of validatedData.collections) {
				const collection = await Collection.create(
					{
						name: collectionData.name,
						description: collectionData.description ?? null,
						visibility: collectionData.visibility as any,
						icon: collectionData.icon ?? null,
						authorId: userId,
					},
					{ client: transaction }
				);

				const links = collectionData.links ?? [];
				if (links.length > 0) {
					await Link.createMany(
						links.map((linkData) => ({
							name: linkData.name,
							description: linkData.description ?? null,
							url: linkData.url,
							favorite: linkData.favorite,
							collectionId: collection.id,
							authorId: userId,
						})),
						{ client: transaction }
					);
				}
			}
		});
	}
}
