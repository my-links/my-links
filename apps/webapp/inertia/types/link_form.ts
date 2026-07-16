import type { Data } from '@generated/data';

export type FormLinkData = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	collectionId: Data.Collection['id'];
};
