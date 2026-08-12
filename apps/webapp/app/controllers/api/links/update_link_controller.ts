import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkService } from '#services/links/link_service';
import { updateLinkAction } from '#controllers/links/actions/update_link_action';

@inject()
export default class UpdateLinkController {
	constructor(protected readonly linkService: LinkService) {}

	async execute(ctx: HttpContext) {
		await updateLinkAction(ctx, this.linkService);

		return ctx.response.json({
			message: 'Link updated successfully',
		});
	}
}
