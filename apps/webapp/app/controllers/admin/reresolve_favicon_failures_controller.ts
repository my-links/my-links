import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { FaviconAdminService } from '#services/favicons/favicon_admin_service';

@inject()
export default class ReResolveFaviconFailuresController {
	constructor(protected readonly faviconAdminService: FaviconAdminService) {}

	async execute({ session, response }: HttpContext) {
		const { attempted, succeeded } =
			await this.faviconAdminService.reResolveFailures();

		session.flash(
			'success',
			`Re-resolved ${succeeded} of ${attempted} failing favicon(s)`
		);
		return response.redirect().back();
	}
}
