import { Visibility } from '~/types/app';

export type FormCollectionData = {
	name: string;
	description: string | null;
	visibility: Visibility;
	icon: string | null;
};
