import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { UserService } from '#services/user/user_service';
import { resolveAdminActionTarget } from '#controllers/admin/actions/resolve_admin_action_target';

export const ACCOUNT_RESTORED_MESSAGE =
	'That account is no longer scheduled for deletion';

/**
 * Cancels a pending deletion from the dashboard, self-service or
 * administrator-initiated alike — `UserService.reactivateAccount` is the same
 * one the login-time confirmation screen calls for the self-service case.
 */
@inject()
export default class RestoreAccountController {
	constructor(protected readonly userService: UserService) {}

	async execute(ctx: HttpContext) {
		const { account, administrator } = await resolveAdminActionTarget(
			ctx,
			this.userService
		);

		await this.userService.reactivateAccount(account.id, administrator.id);

		ctx.session.flash('success', ACCOUNT_RESTORED_MESSAGE);

		return ctx.response.redirect().back();
	}
}
