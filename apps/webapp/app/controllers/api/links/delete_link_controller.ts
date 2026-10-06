import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkService } from '#services/links/link_service';
import { LinkQueryService } from '#services/links/link_query_service';
import { deleteLinkAction } from '#controllers/links/actions/delete_link_action';

@inject()
export default class DeleteLinkController {
	constructor(
		protected linkService: LinkService,
		protected linkQueryService: LinkQueryService
	) {}

	async execute(ctx: HttpContext) {
		await deleteLinkAction(ctx, this.linkService, this.linkQueryService);

		return ctx.response.json({
			message: 'Link deleted successfully',
		});
	}
}
