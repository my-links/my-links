import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { FaviconOrphanPurgeService } from '#services/favicons/favicon_orphan_purge_service';

const purgedMessage = (deletedEntries: number, deletedFiles: number) =>
	`Purged ${deletedEntries} orphaned entries and ${deletedFiles} orphaned files`;

@inject()
export default class PurgeFaviconOrphansController {
	constructor(protected readonly purgeService: FaviconOrphanPurgeService) {}

	async execute({ session, response }: HttpContext) {
		const { deletedEntries, deletedFiles } =
			await this.purgeService.purgeOrphans();

		session.flash('success', purgedMessage(deletedEntries, deletedFiles));
		return response.redirect().back();
	}
}
