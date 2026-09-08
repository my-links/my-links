import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { FaviconAdminService } from '#services/favicons/favicon_admin_service';

@inject()
export default class FaviconStatsController {
	constructor(protected readonly faviconAdminService: FaviconAdminService) {}

	async render({ inertia }: HttpContext) {
		const stats = await this.faviconAdminService.getStats();

		return inertia.render('admin/favicons', stats);
	}
}
