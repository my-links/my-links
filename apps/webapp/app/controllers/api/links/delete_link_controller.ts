import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { deleteLinkAction } from '#controllers/links/actions/delete_link_action';
import { resolveRequestOrigin } from '#lib/request_origin';
import { LinkQueryService } from '#services/links/link_query_service';
import { LinkService } from '#services/links/link_service';
import { deleteLinkValidator } from '#validators/links/delete_link_validator';

@inject()
export default class DeleteLinkController {
	constructor(
		protected linkService: LinkService,
		protected linkQueryService: LinkQueryService
	) {}

	async execute({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(deleteLinkValidator);

		await deleteLinkAction(
			{
				payload,
				userId: auth.getUserOrFail().id,
				origin: resolveRequestOrigin({ request }),
			},
			this.linkService,
			this.linkQueryService
		);

		return response.json({ message: 'Link deleted successfully' });
	}
}
