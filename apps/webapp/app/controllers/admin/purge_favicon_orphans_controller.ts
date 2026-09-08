import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { FaviconOrphanPurgeService } from '#services/favicons/favicon_orphan_purge_service';

@inject()
export default class PurgeFaviconOrphansController {
	constructor(protected readonly purgeService: FaviconOrphanPurgeService) {}

	async execute({ session, response }: HttpContext) {
		const { deletedEntries, deletedFiles } =
			await this.purgeService.purgeOrphans();

		session.flash(
			'success',
			`Purged ${deletedEntries} orphaned entrie(s) and ${deletedFiles} orphaned file(s)`
		);
		return response.redirect().back();
	}
}
