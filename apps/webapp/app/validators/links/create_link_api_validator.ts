import vine from '@vinejs/vine';

import { baseLinkValidator } from '#validators/links/base_link_validator';

/**
 * API-only variant of the create-link validator: `collectionId` is optional
 * here because API clients (the browser extension's quick-add) may not have
 * a collection picked yet. `LinkService.createLink` falls back to the
 * user's default collection in that case. The webapp's own create-link flow
 * keeps using `createLinkValidator` (collectionId required, drives the
 * post-create redirect).
 */
export const createLinkApiValidator = vine.create(
	vine.object({
		...baseLinkValidator.getProperties(),
		collectionId: vine.number().optional(),
	})
);
