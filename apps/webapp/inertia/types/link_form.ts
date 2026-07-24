import type { Data } from '@generated/data';

export type FormLinkData = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	collectionIds: Data.Collection['id'][];
};
