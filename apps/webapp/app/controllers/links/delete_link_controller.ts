import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkService } from '#services/links/link_service';
import { deleteLinkAction } from '#controllers/links/actions/delete_link_action';

@inject()
export default class DeleteLinkController {
	constructor(protected linkService: LinkService) {}

	async execute(ctx: HttpContext) {
		const { primaryCollectionId } = await deleteLinkAction(
			ctx,
			this.linkService
		);

		return ctx.response.redirect().toRoute('collection.show', {
			id: primaryCollectionId,
		});
	}
}
