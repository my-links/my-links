import type Link from '#models/link';

export type SearchResult =
  | {
      id: string;
      type: 'collection';
      name: string;
      matched_part?: string;
      rank?: number;
    }
  | {
      id: string;
      type: 'link';
      name: string;
      matched_part?: string;
      rank?: number;
      collection_id: number;
    };
