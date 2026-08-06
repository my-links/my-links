import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

import type User from '#models/user';
import { SessionData } from '#types/session';
import UserSession from '#models/user_session';
import { UaParserService } from '#services/ua_parser_service';
import { SudoModeService } from '#services/auth/sudo_mode_service';

@inject()
export class SessionService {
	constructor(
		protected readonly uaParserService: UaParserService,
		protected readonly sudoModeService: SudoModeService
	) {}

	async getSessions(user: User) {
		const sessions = await UserSession.query()
			.where('userId', String(user.id))
			.orderBy('expiresAt', 'desc');
		return sessions;
	}

	async createAuthSession(user: User): Promise<void> {
		const ctx = HttpContext.getOrFail();
		ctx.session.regenerate();
		await ctx.session.tag(String(user.id));

		const userAgent = ctx.request.header('user-agent');
		const parsedUserAgent = this.uaParserService.parse(userAgent);
		const ip = ctx.request.ip();

		const sessionData = {
			ip,
			userAgent: userAgent ?? null,
			browser: {
				name: parsedUserAgent?.browser?.name ?? null,
				version: parsedUserAgent?.browser?.version ?? null,
				type: parsedUserAgent?.browser?.type ?? null,
			},
			engine: {
				name: parsedUserAgent?.engine?.name ?? null,
				version: parsedUserAgent?.engine?.version ?? null,
			},
		} satisfies SessionData;
		ctx.session.put('client', sessionData);

		// Both sign-in paths land here, so this is the one place that can
		// promise a freshly authenticated session already counts as a recent
		// proof of identity — without it, every login would be followed by a
		// prompt for the credential just typed.
		this.sudoModeService.confirm(ctx.session);
	}

	/**
	 * Signs every other browser out, keeping the one that asked for it.
	 *
	 * A password change that left the old sessions alive would revoke nothing
	 * at all — the whole point is that whoever was already inside stops being
	 * inside. `null` keeps none of them, which is what a reset needs: the
	 * person driving it is not signed in anywhere yet.
	 */
	async revokeAllExcept(
		user: User,
		sessionIdToKeep: string | null
	): Promise<void> {
		const query = UserSession.query().where('userId', String(user.id));

		if (sessionIdToKeep) {
			query.whereNot('id', sessionIdToKeep);
		}

		await query.delete();
	}

	async revokeSession(user: User, sessionId: string): Promise<void> {
		const ctx = HttpContext.getOrFail();

		// Deleting the row directly wouldn't sign out the request that's running it.
		if (sessionId === ctx.session.sessionId) {
			await ctx.auth.use('web').logout();
			return;
		}

		const session = await UserSession.query()
			.where('userId', String(user.id))
			.where('id', sessionId)
			.firstOrFail();

		await session.delete();
	}
}
