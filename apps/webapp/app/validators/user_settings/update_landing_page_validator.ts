import vine from '@vinejs/vine';

import { LANDING_PAGE } from '#enums/dashboard/landing_page';

export const updateLandingPageValidator = vine.create(
	vine.object({
		defaultLandingPage: vine.enum(Object.values(LANDING_PAGE)),
	})
);
