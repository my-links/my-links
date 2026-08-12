import type { HttpContext } from '@adonisjs/core/http';

import type User from '#models/user';
import type { AuthEventType } from '#constants/auth';
import { resolveRequestOrigin } from '#lib/request_origin';
import type { AuthEventService } from '#services/auth/auth_event_service';

/**
 * The audit step every admin account action ends with, before the
 * flash-and-redirect each controller still owns (the message differs per
 * action, and a couple branch before ever reaching this point).
 */
export async function recordAdminAction(
	ctx: HttpContext,
	authEventService: AuthEventService,
	{
		type,
		account,
		administrator,
	}: { type: AuthEventType; account: User; administrator: User }
): Promise<void> {
	await authEventService.recordAdminAction({
		type,
		userId: account.id,
		actorId: administrator.id,
		...resolveRequestOrigin(ctx),
	});
}
