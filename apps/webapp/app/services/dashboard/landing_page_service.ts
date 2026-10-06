import { inject } from '@adonisjs/core';

import type User from '#models/user';
import { LinkService } from '#services/links/link_service';
import {
	LANDING_PAGE,
	LANDING_PAGE_ROUTE_NAME,
	type LandingPage,
} from '#enums/dashboard/landing_page';

/** Decides which dashboard page a signed-in visitor lands on. */
@inject()
export class LandingPageService {
	constructor(protected readonly linkService: LinkService) {}

	async resolveRouteName(
		userId: User['id']
	): Promise<(typeof LANDING_PAGE_ROUTE_NAME)[LandingPage]> {
		const hasFavoriteLinks = await this.linkService.hasFavoriteLinks(userId);
		const landingPage = hasFavoriteLinks
			? LANDING_PAGE.FAVORITES
			: LANDING_PAGE.INBOX;

		return LANDING_PAGE_ROUTE_NAME[landingPage];
	}
}
