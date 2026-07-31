import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import type User from '#models/user';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { UserService } from '#services/user/user_service';
import { ACCOUNT_ROLE, type AccountRole } from '#constants/account';
import { AuthEventService } from '#services/auth/auth_event_service';
import { resolveAuthEventOrigin } from '#lib/auth/auth_event_origin';
import { accountRoleValidator } from '#validators/admin/account_role_validator';
import { accountTargetValidator } from '#validators/admin/account_target_validator';

export const ROLE_CHANGED_MESSAGES = {
	[ACCOUNT_ROLE.ADMINISTRATOR]: 'That account is now an administrator',
	[ACCOUNT_ROLE.MEMBER]: 'That account is now a member',
} as const satisfies Record<AccountRole, string>;

/**
 * Hands the administrator role over, or takes it back.
 *
 * The last administrator is refused by `UserService`, under a lock, rather than
 * by this controller: an instance with none has no way left to hand the role
 * out again, and the button is not the only caller.
 */
@inject()
export default class SetAccountRoleController {
	constructor(
		protected readonly userService: UserService,
		protected readonly authEventService: AuthEventService
	) {}

	async execute(ctx: HttpContext) {
		const { id } = await ctx.request.validateUsing(accountTargetValidator, {
			data: ctx.params,
		});
		const { role } = await ctx.request.validateUsing(accountRoleValidator);
		const administrator = ctx.auth.getUserOrFail();
		const account = await this.userService.findAccountOrFail(id);

		await this.applyRole(account, role);

		await this.authEventService.recordAdminAction({
			type:
				role === ACCOUNT_ROLE.ADMINISTRATOR
					? AUTH_EVENT_TYPE.ROLE_PROMOTED
					: AUTH_EVENT_TYPE.ROLE_DEMOTED,
			userId: account.id,
			actorId: administrator.id,
			...resolveAuthEventOrigin(ctx),
		});

		ctx.session.flash('success', ROLE_CHANGED_MESSAGES[role]);

		return ctx.response.redirect().back();
	}

	private applyRole(account: User, role: AccountRole): Promise<void> {
		if (role === ACCOUNT_ROLE.ADMINISTRATOR) {
			return this.userService.promoteToAdministrator(account);
		}

		return this.userService.demoteToMember(account);
	}
}
