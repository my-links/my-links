import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { FaviconAdminService } from '#services/favicons/favicon_admin_service';

const flushedMessage = (deletedEntries: number) =>
	`Flushed ${deletedEntries} favicon(s). Links re-resolve their icon on next view`;

@inject()
export default class FlushFaviconCacheController {
	constructor(protected readonly faviconAdminService: FaviconAdminService) {}

	async execute({ session, response }: HttpContext) {
		const { deletedEntries } = await this.faviconAdminService.flushAll();

		session.flash('success', flushedMessage(deletedEntries));
		return response.redirect().back();
	}
}
