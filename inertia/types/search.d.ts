type SearchResultCommon = {
  id: number;
  name: string;
  matched_part?: string;
  rank?: number;
};

export type SearchResultCollection = SearchResultCommon & {
  type: 'collection';
};

export type SearchResultLink = SearchResultCommon & {
  type: 'link';
  collection_id: number;
  url: string;
};

export type SearchResult = SearchResultCollection | SearchResultLink;
