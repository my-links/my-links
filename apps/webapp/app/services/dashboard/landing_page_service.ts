import { inject } from '@adonisjs/core';

import type User from '#models/user';
import { LinkQueryService } from '#services/links/link_query_service';
import {
	LANDING_PAGE,
	LANDING_PAGE_ROUTE_NAME,
	type LandingPage,
} from '#enums/dashboard/landing_page';

/** Decides which dashboard page a signed-in visitor lands on. */
@inject()
export class LandingPageService {
	constructor(protected readonly linkQueryService: LinkQueryService) {}

	async resolveRouteName(
		user: User
	): Promise<(typeof LANDING_PAGE_ROUTE_NAME)[LandingPage]> {
		const landingPage = await this.resolveLandingPage(user);

		return LANDING_PAGE_ROUTE_NAME[landingPage];
	}

	private async resolveLandingPage(user: User): Promise<LandingPage> {
		if (user.defaultLandingPage === LANDING_PAGE.INBOX) {
			return LANDING_PAGE.INBOX;
		}

		const hasFavoriteLinks = await this.linkQueryService.hasFavoriteLinks(
			user.id
		);

		return hasFavoriteLinks ? LANDING_PAGE.FAVORITES : LANDING_PAGE.INBOX;
	}
}
