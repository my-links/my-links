export type SearchResultType = 'link' | 'collection';

export class SearchResultDto {
	declare id: number;
	declare type: SearchResultType;
	declare name: string;
	declare url: string | null;
	declare collectionId: number | null;
	declare icon: string | null;
	declare matchedPart: string | null;
	declare rank: number | null;

	constructor(data: {
		id: number;
		type: SearchResultType;
		name: string;
		url: string | null;
		collection_id: number | null;
		icon: string | null;
		matched_part: string | null;
		rank: number | null;
	}) {
		this.id = data.id;
		this.type = data.type;
		this.name = data.name;
		this.url = data.url;
		this.collectionId = data.collection_id;
		this.icon = data.icon;
		this.matchedPart = data.matched_part;
		this.rank = data.rank;
	}

	serialize(): {
		id: number;
		type: SearchResultType;
		name: string;
		url: string | null;
		collectionId: number | null;
		icon: string | null;
		matchedPart: string | null;
		rank: number | null;
	} {
		return {
			id: this.id,
			type: this.type,
			name: this.name,
			url: this.url,
			collectionId: this.collectionId,
			icon: this.icon,
			matchedPart: this.matchedPart,
			rank: this.rank,
		};
	}
}

export class SearchResultsDto {
	declare results: SearchResultDto[];

	constructor(results: SearchResultDto[]) {
		this.results = results;
	}

	serialize(): {
		results: ReturnType<SearchResultDto['serialize']>[];
	} {
		return {
			results: this.results.map((result) => result.serialize()),
		};
	}
}
