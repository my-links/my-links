import type { HttpContext } from '@adonisjs/core/http';

import type User from '#models/user';
import type { AccountQueryService } from '#services/user/account_query_service';
import { accountTargetValidator } from '#validators/admin/account_target_validator';

/**
 * The first two steps every admin account action shares: validate the
 * targeted account's id out of the route params, and resolve both accounts
 * involved: the one acted upon and the administrator doing it.
 */
export async function resolveAdminActionTarget(
	ctx: HttpContext,
	accountQueryService: AccountQueryService
): Promise<{ account: User; administrator: User }> {
	const { id } = await ctx.request.validateUsing(accountTargetValidator, {
		data: ctx.params,
	});
	const administrator = ctx.auth.getUserOrFail();
	const account = await accountQueryService.findAccountOrFail(id);

	return { account, administrator };
}
