import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { UserService } from '#services/user/user_service';
import { updateLandingPageValidator } from '#validators/user_settings/update_landing_page_validator';

@inject()
export default class UpdateLandingPageController {
	constructor(protected readonly userService: UserService) {}

	async execute(ctx: HttpContext) {
		const { defaultLandingPage } = await ctx.request.validateUsing(
			updateLandingPageValidator
		);
		const user = ctx.auth.getUserOrFail();

		await this.userService.updateDefaultLandingPage(
			user.id,
			defaultLandingPage
		);

		ctx.session.flash('success', 'Your default page is updated');

		return ctx.response.redirectToNamedRoute('user.settings');
	}
}
