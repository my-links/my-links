import { BaseTransformer } from '@adonisjs/core/transformers';

export type SearchResultType = 'link' | 'collection';

export type SearchResultRow = {
	id: number;
	type: SearchResultType;
	name: string;
	url: string | null;
	collection_id: number | null;
	icon: string | null;
	matched_part: string | null;
	rank: number | null;
};

export default class SearchResultTransformer extends BaseTransformer<SearchResultRow> {
	toObject() {
		const row = this.resource;

		return {
			id: row.id,
			type: row.type,
			name: row.name,
			url: row.url,
			collectionId: row.collection_id,
			icon: row.icon,
			matchedPart: row.matched_part,
			rank: row.rank,
		};
	}
}
