import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';

import { resolveRequestOrigin } from '#lib/request_origin';
import { AccountQueryService } from '#services/user/account_query_service';
import { AccountDeletionService } from '#services/user/account_deletion_service';
import { resolveAdminActionTarget } from '#controllers/admin/actions/resolve_admin_action_target';

export const ACCOUNT_RESTORED_MESSAGE =
	'That account is no longer scheduled for deletion';

/**
 * Cancels a pending deletion from the dashboard, self-service or
 * administrator-initiated alike: `AccountDeletionService.reactivateAccount` is the same
 * one the login-time confirmation screen calls for the self-service case.
 */
@inject()
export default class RestoreAccountController {
	constructor(
		protected readonly accountQueryService: AccountQueryService,
		protected readonly accountDeletionService: AccountDeletionService
	) {}

	async execute(ctx: HttpContext) {
		const { account, administrator } = await resolveAdminActionTarget(
			ctx,
			this.accountQueryService
		);

		await this.accountDeletionService.reactivateAccount(
			account.id,
			resolveRequestOrigin(ctx),
			administrator.id
		);

		ctx.session.flash('success', ACCOUNT_RESTORED_MESSAGE);

		return ctx.response.redirect().back();
	}
}
