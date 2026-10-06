import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { FaviconAdminService } from '#services/favicons/favicon_admin_service';

const reResolvedMessage = (succeeded: number, attempted: number) =>
	`Re-resolved ${succeeded} of ${attempted} failing favicon(s)`;

@inject()
export default class ReResolveFaviconFailuresController {
	constructor(protected readonly faviconAdminService: FaviconAdminService) {}

	async execute({ session, response }: HttpContext) {
		const { attempted, succeeded } =
			await this.faviconAdminService.reResolveFailures();

		session.flash('success', reResolvedMessage(succeeded, attempted));
		return response.redirect().back();
	}
}
