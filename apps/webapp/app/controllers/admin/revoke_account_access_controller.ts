import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { UserService } from '#services/user/user_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { AccountAccessService } from '#services/auth/account_access_service';
import { recordAdminAction } from '#controllers/admin/actions/record_admin_action';
import { resolveAdminActionTarget } from '#controllers/admin/actions/resolve_admin_action_target';

export const ACCESS_REVOKED_MESSAGE =
	'Every session and extension token of that account has been revoked';

/**
 * Signs an account out of everywhere and drops its extension tokens.
 *
 * `null` keeps no session at all, including the account's current one: an
 * administrator reaching for this is cutting off access somebody else holds,
 * and sparing one browser would spare exactly the one they cannot see.
 */
@inject()
export default class RevokeAccountAccessController {
	constructor(
		protected readonly userService: UserService,
		protected readonly accountAccessService: AccountAccessService,
		protected readonly authEventService: AuthEventService
	) {}

	async execute(ctx: HttpContext) {
		const { account, administrator } = await resolveAdminActionTarget(
			ctx,
			this.userService
		);

		await this.accountAccessService.revokeAllExcept(account, null);

		await recordAdminAction(ctx, this.authEventService, {
			type: AUTH_EVENT_TYPE.ACCESS_REVOKED,
			account,
			administrator,
		});

		ctx.session.flash('success', ACCESS_REVOKED_MESSAGE);

		return ctx.response.redirect().back();
	}
}
