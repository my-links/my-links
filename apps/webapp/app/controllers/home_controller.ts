import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { LandingPageService } from '#services/dashboard/landing_page_service';

@inject()
export default class HomeController {
	constructor(protected readonly landingPageService: LandingPageService) {}

	async render({ auth, inertia, response, session }: HttpContext) {
		if (await auth.use(auth.defaultGuard).check()) {
			const routeName = await this.landingPageService.resolveRouteName(
				auth.getUserOrFail().id
			);
			session.reflash();
			return response.redirect().toRoute(routeName);
		}

		return inertia.render('home', {});
	}
}
