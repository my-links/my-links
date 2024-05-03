import type Link from '#models/link';

export interface SearchItem {
  id: string;
  name: string;
  url: string;
  type: 'collection' | 'link';
  collection?: undefined | Link['collection'];
}

export interface SearchResult {
  id: string;
  name: React.ReactNode; // React node to support bold text
  url: string;
  type: 'collection' | 'link';
  collection?: undefined | Link['collection'];
}
