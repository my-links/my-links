import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { FaviconAdminService } from '#services/favicons/favicon_admin_service';

@inject()
export default class FlushFaviconCacheController {
	constructor(protected readonly faviconAdminService: FaviconAdminService) {}

	async execute({ session, response }: HttpContext) {
		const { deletedEntries } = await this.faviconAdminService.flushAll();

		session.flash(
			'success',
			`Flushed ${deletedEntries} favicon(s) — links re-resolve their icon on next view`
		);
		return response.redirect().back();
	}
}
