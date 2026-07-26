import db from '@adonisjs/lucid/services/db';

import Collection from '#models/collection';

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
	icon: string | null;
	matched_part: string | null;
	rank: number | null;
};

/**
 * Shape returned by the `search_text` SQL function — see the migration that
 * declares it. Naming it here is what lets the rest of the method be typed
 * instead of walking rows as `any` and asserting the result on the way out.
 */
type SearchTextResult = {
	rows: SearchResultRow[];
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

		const { rows } = await db.rawQuery<SearchTextResult>(
			'SELECT * FROM search_text(?, ?)',
			[term.trim(), userId]
		);

		const matchingRows =
			type === 'both' ? rows : rows.filter((row) => row.type === type);
		const collectionIcons = await this.getCollectionIcons(matchingRows);

		return matchingRows.map((row) => ({
			...row,
			icon:
				row.type === 'collection' ? (collectionIcons[row.id] ?? null) : null,
		}));
	}

	/**
	 * The search function returns no icon, so collections get theirs in a single
	 * extra query rather than one per row.
	 */
	private async getCollectionIcons(
		rows: SearchResultRow[]
	): Promise<Record<number, string | null>> {
		const collectionIds = rows
			.filter((row) => row.type === 'collection')
			.map((row) => row.id);

		if (collectionIds.length === 0) {
			return {};
		}

		const collections = await Collection.query()
			.whereIn('id', collectionIds)
			.select('id', 'icon');

		const iconsByCollectionId: Record<number, string | null> = {};
		for (const collection of collections) {
			iconsByCollectionId[collection.id] = collection.icon;
		}

		return iconsByCollectionId;
	}
}
