import { inject } from '@adonisjs/core';

import type User from '#models/user';
import { SessionService } from '#services/user/session_service';
import { ApiTokenService } from '#services/user/api_token_service';

/**
 * Cutting off everything an account is currently reachable through.
 *
 * Sessions and access tokens are two separate stores, and a flow that clears
 * one but not the other revokes nothing an attacker cares about: a browser
 * extension holds a bearer token that outlives every cookie. Naming the pair
 * once is what keeps the two flows that need it — replacing a password, and
 * disowning an email change nobody asked for — from drifting apart.
 */
@inject()
export class AccountAccessService {
	constructor(
		protected readonly sessionService: SessionService,
		protected readonly apiTokenService: ApiTokenService
	) {}

	/**
	 * `null` keeps no session at all, which is what a flow driven from a mailbox
	 * needs: whoever asked for it is not signed in anywhere, and whoever is
	 * signed in is precisely who this is being taken away from.
	 */
	async revokeAllExcept(
		user: User,
		sessionIdToKeep: string | null
	): Promise<void> {
		await this.sessionService.revokeAllExcept(user, sessionIdToKeep);
		await this.apiTokenService.revokeAllTokens(user);
	}
}
