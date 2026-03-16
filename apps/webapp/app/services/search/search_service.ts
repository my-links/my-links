import Collection from '#models/collection';
import db from '@adonisjs/lucid/services/db';

export type SearchType = 'link' | 'collection' | 'both';

type SearchOptions = {
	term: string;
	type?: SearchType;
	userId: number;
};

type SearchResultRow = {
	id: number;
	type: 'link' | 'collection';
	name: string;
	url: string | null;
	collection_id: number | null;
	icon: string | null;
	matched_part: string | null;
	rank: number | null;
};

export class SearchService {
	async search({
		term,
		type = 'both',
		userId,
	}: SearchOptions): Promise<SearchResultRow[]> {
		if (!term || term.trim().length === 0) {
			return [];
		}

		const { rows } = await db.rawQuery('SELECT * FROM search_text(?, ?)', [
			term.trim(),
			userId,
		]);

		let filteredResults = rows;

		if (type !== 'both') {
			filteredResults = rows.filter((row: any) => row.type === type);
		}

		const collectionIds = filteredResults
			.filter((row: any) => row.type === 'collection')
			.map((row: any) => row.id);

		let collectionIconsMap: Record<number, string | null> = {};

		if (collectionIds.length > 0) {
			const collections = await Collection.query()
				.whereIn('id', collectionIds)
				.select('id', 'icon');

			collectionIconsMap = collections.reduce(
				(acc, collection) => {
					acc[collection.id] = collection.icon;
					return acc;
				},
				{} as Record<number, string | null>
			);
		}

		const enrichedResults = filteredResults.map((row: any) => ({
			...row,
			icon:
				row.type === 'collection' ? collectionIconsMap[row.id] || null : null,
		}));

		return enrichedResults as SearchResultRow[];
	}
}
