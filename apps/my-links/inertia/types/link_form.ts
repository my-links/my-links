import { CollectionWithLinks } from '#shared/types/dto';

export type FormLinkData = {
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	collectionId: CollectionWithLinks['id'];
};
