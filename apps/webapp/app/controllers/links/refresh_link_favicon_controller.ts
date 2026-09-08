import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { LinkService } from '#services/links/link_service';
import { refreshLinkFaviconValidator } from '#validators/links/refresh_link_favicon_validator';

const FAVICON_REFRESHED_MESSAGE = 'Favicon refreshed';

@inject()
export default class RefreshLinkFaviconController {
	constructor(protected readonly linkService: LinkService) {}

	async execute({ request, response, session }: HttpContext) {
		const {
			params: { id: linkId },
		} = await request.validateUsing(refreshLinkFaviconValidator);

		await this.linkService.refreshFavicon(linkId);

		session.flash('success', FAVICON_REFRESHED_MESSAGE);
		return response.redirect().back();
	}
}
