type SearchResultCommon = {
	id: number;
	name: string;
	matched_part?: string;
	rank?: number;
	description?: string;
};

export type SearchResultCollection = SearchResultCommon & {
	type: 'collection';
};

export type SearchResultLink = SearchResultCommon & {
	type: 'link';
	collectionId: number;
	url: string;
};

export type SearchResult = SearchResultCollection | SearchResultLink;
