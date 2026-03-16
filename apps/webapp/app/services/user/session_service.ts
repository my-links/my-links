import type User from '#models/user';
import UserSession from '#models/user_session';
import { UaParserService } from '#services/ua_parser_service';
import { SessionData } from '#types/session';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';

@inject()
export class SessionService {
	constructor(protected readonly uaParserService: UaParserService) {}

	async getSessions(user: User) {
		const sessions = await UserSession.query()
			.where('userId', String(user.id))
			.orderBy('expiresAt', 'desc');
		return sessions;
	}

	createAuthSession(user: User) {
		const ctx = HttpContext.getOrFail();
		ctx.session.regenerate();
		ctx.session.tag(String(user.id));

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
	}

	async revokeSession(user: User, sessionId: string): Promise<void> {
		const session = await UserSession.query()
			.where('userId', String(user.id))
			.where('id', sessionId)
			.firstOrFail();

		await session.delete();
	}
}
