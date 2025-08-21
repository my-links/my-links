import { api } from '#adonis/api';

export type ApiRouteName = (typeof api.routes)[number]['name'];

export type CollectionListDisplay = 'list' | 'inline';
export type LinkListDisplay = 'list' | 'grid';

export type DisplayPreferences = {
	linkListDisplay: LinkListDisplay;
	collectionListDisplay: CollectionListDisplay;
};
