import type { AccessToken } from '@adonisjs/auth/access_tokens';
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';

import {
	EXTENSION_TOKEN_LIFETIME_DAYS,
	EXTENSION_TOKEN_MARKER_ABILITY,
	EXTENSION_TOKEN_RENEWAL_THRESHOLD_DAYS,
	API_TOKEN_SCOPE,
	API_TOKEN_SCOPE_ABILITIES,
	type ApiTokenScope,
} from '#constants/api_token';
import { ApiTokenNotFoundException } from '#exceptions/user/api_token_not_found_exception';
import User from '#models/user';

type CreateTokenParams = {
	name: string;
	expiresAt?: Date;
	scope?: ApiTokenScope;
};

const MILLISECONDS_PER_SECOND = 1000;
const ACCESS_TOKENS_TABLE = 'auth_access_tokens';
const EXTENSION_TOKEN_NAME = 'Browser extension';

export class ApiTokenService {
	createToken(
		user: User,
		{ name, expiresAt, scope = API_TOKEN_SCOPE.FULL_ACCESS }: CreateTokenParams
	) {
		const expiresIn = expiresAt
			? Math.round((expiresAt.getTime() - Date.now()) / MILLISECONDS_PER_SECOND)
			: undefined;
		return User.accessTokens.create(
			user,
			[...API_TOKEN_SCOPE_ABILITIES[scope]],
			{
				name,
				expiresIn,
			}
		);
	}

	createExtensionToken(user: User) {
		return User.accessTokens.create(
			user,
			[
				...API_TOKEN_SCOPE_ABILITIES[API_TOKEN_SCOPE.FULL_ACCESS],
				EXTENSION_TOKEN_MARKER_ABILITY,
			],
			{
				name: EXTENSION_TOKEN_NAME,
				expiresIn: `${EXTENSION_TOKEN_LIFETIME_DAYS} days`,
			}
		);
	}

	/**
	 * Rolling expiry for extension tokens: a token that keeps being used never
	 * lapses, one left alone for the whole lifetime does. The write happens at
	 * most once per threshold, never on every request.
	 */
	async renewExtensionToken(token: AccessToken): Promise<void> {
		if (!token.abilities.includes(EXTENSION_TOKEN_MARKER_ABILITY)) return;
		if (!token.expiresAt) return;

		const renewalDeadline = DateTime.now().plus({
			days:
				EXTENSION_TOKEN_LIFETIME_DAYS - EXTENSION_TOKEN_RENEWAL_THRESHOLD_DAYS,
		});
		if (DateTime.fromJSDate(token.expiresAt) > renewalDeadline) return;

		await db
			.from(ACCESS_TOKENS_TABLE)
			.where('id', Number(token.identifier))
			.update({
				expires_at: DateTime.now()
					.plus({ days: EXTENSION_TOKEN_LIFETIME_DAYS })
					.toJSDate(),
			});
	}

	getTokens(user: User) {
		return User.accessTokens.all(user);
	}

	/**
	 * Drops every access token the account has.
	 *
	 * A browser extension holds a bearer token that outlives any session, so a
	 * password change that only cleared sessions would leave the compromised
	 * access it was meant to cut exactly where it was. The owner pairs their
	 * extension again: that is the intended cost.
	 */
	async revokeAllTokens(user: User): Promise<void> {
		const tokens = await User.accessTokens.all(user);

		await Promise.all(
			tokens.map((token) =>
				User.accessTokens.delete(user, Number(token.identifier))
			)
		);
	}

	/**
	 * The lookup is what scopes a revocation to its owner: `accessTokens.find`
	 * only returns tokens belonging to the user handed in, so an identifier
	 * from another account is a miss instead of a deletion.
	 */
	async revokeToken(user: User, tokenId: string): Promise<void> {
		const token = await User.accessTokens.find(user, tokenId);

		if (!token) {
			throw new ApiTokenNotFoundException();
		}

		await User.accessTokens.delete(user, Number(token.identifier));
	}
}
