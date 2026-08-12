import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { moveLinkAction } from '#controllers/links/actions/move_link_action';
import { CollectionLinkService } from '#services/collections/collection_link_service';

@inject()
export default class MoveLinkController {
	constructor(
		protected readonly collectionLinkService: CollectionLinkService
	) {}

	async execute(ctx: HttpContext) {
		await moveLinkAction(ctx, this.collectionLinkService);

		return ctx.response.json({ message: 'Link moved successfully' });
	}
}
