import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { FaviconAdminService } from '#services/favicons/favicon_admin_service';

@inject()
export default class ReResolveAllFaviconsController {
	constructor(protected readonly faviconAdminService: FaviconAdminService) {}

	async execute({ session, response }: HttpContext) {
		const { attempted, succeeded } =
			await this.faviconAdminService.reResolveAll();

		session.flash(
			'success',
			`Re-resolved ${succeeded} of ${attempted} favicon(s)`
		);
		return response.redirect().back();
	}
}
