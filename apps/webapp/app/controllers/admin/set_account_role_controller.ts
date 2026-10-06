import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import type User from '#models/user';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { ACCOUNT_ROLE, type AccountRole } from '#constants/account';
import { AuthEventService } from '#services/auth/auth_event_service';
import { AccountRoleService } from '#services/user/account_role_service';
import { AccountQueryService } from '#services/user/account_query_service';
import { accountRoleValidator } from '#validators/admin/account_role_validator';
import { recordAdminAction } from '#controllers/admin/actions/record_admin_action';
import { resolveAdminActionTarget } from '#controllers/admin/actions/resolve_admin_action_target';

export const ROLE_CHANGED_MESSAGES = {
	[ACCOUNT_ROLE.ADMINISTRATOR]: 'That account is now an administrator',
	[ACCOUNT_ROLE.MEMBER]: 'That account is now a member',
} as const satisfies Record<AccountRole, string>;

/**
 * Hands the administrator role over, or takes it back.
 *
 * The last administrator is refused by `AccountRoleService`, under a lock, rather than
 * by this controller: an instance with none has no way left to hand the role
 * out again, and the button is not the only caller.
 */
@inject()
export default class SetAccountRoleController {
	constructor(
		protected readonly accountQueryService: AccountQueryService,
		protected readonly accountRoleService: AccountRoleService,
		protected readonly authEventService: AuthEventService
	) {}

	async execute(ctx: HttpContext) {
		const { account, administrator } = await resolveAdminActionTarget(
			ctx,
			this.accountQueryService
		);
		const { role } = await ctx.request.validateUsing(accountRoleValidator);

		await this.applyRole(account, role);

		await recordAdminAction(ctx, this.authEventService, {
			type:
				role === ACCOUNT_ROLE.ADMINISTRATOR
					? AUTH_EVENT_TYPE.ROLE_PROMOTED
					: AUTH_EVENT_TYPE.ROLE_DEMOTED,
			account,
			administrator,
		});

		ctx.session.flash('success', ROLE_CHANGED_MESSAGES[role]);

		return ctx.response.redirect().back();
	}

	private applyRole(account: User, role: AccountRole): Promise<void> {
		if (role === ACCOUNT_ROLE.ADMINISTRATOR) {
			return this.accountRoleService.promoteToAdministrator(account);
		}

		return this.accountRoleService.demoteToMember(account);
	}
}
