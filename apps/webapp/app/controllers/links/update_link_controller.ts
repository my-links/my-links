import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { LinkService } from '#services/links/link_service';
import { updateLinkValidator } from '#validators/links/update_link_validator';

@inject()
export default class UpdateLinkController {
	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, auth, response }: HttpContext) {
		const { params, ...payload } =
			await request.validateUsing(updateLinkValidator);

		await this.linkService.updateLink(
			auth.getUserOrFail().id,
			params.id,
			payload,
			resolveRequestOrigin({ request })
		);

		return response.redirect().back();
	}
}
