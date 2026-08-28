import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import { UserService } from '#services/user/user_service';
import { renameAccountValidator } from '#validators/user_settings/rename_account_validator';

@inject()
export default class RenameAccountController {
	constructor(protected readonly userService: UserService) {}

	async execute(ctx: HttpContext) {
		const { nickName } = await ctx.request.validateUsing(
			renameAccountValidator
		);
		const user = ctx.auth.getUserOrFail();

		await this.userService.renameAccount(user.id, nickName);

		ctx.session.flash('success', 'Your account name is updated');

		return ctx.response.redirectToNamedRoute('user.settings');
	}
}
