import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import type { AuthProvider } from '#constants/auth';
import { UserService } from '#services/user/user_service';
import OauthAuthenticationRefusedException, {
	OAUTH_REFUSAL_REASON,
} from '#exceptions/auth/oauth_authentication_refused_exception';

/**
 * Provider-agnostic description of the account an OAuth callback just proved
 * ownership of.
 */
export type OauthIdentity = {
	readonly provider: AuthProvider;
	readonly providerUserId: string;
	readonly email: string | null;
	readonly isEmailVerified: boolean;
	readonly name: string;
	readonly nickName: string;
	readonly avatarUrl: string | null;
};

@inject()
export class OauthAccountService {
	constructor(protected readonly userService: UserService) {}

	/**
	 * Resolves an OAuth identity to the account it belongs to, creating that
	 * account on first sight.
	 *
	 * An email that already belongs to an unlinked account is refused rather
	 * than merged: a provider is only trusted for the identity it owns, never
	 * to take over an account someone else created.
	 */
	async authenticate(identity: OauthIdentity): Promise<User> {
		const trustedEmail = this.getTrustedEmail(identity);

		const linkedUser = await this.findLinkedUser(identity);
		if (linkedUser) {
			return this.refreshProfile(linkedUser, identity);
		}

		await this.assertEmailIsAvailable(trustedEmail);

		return this.createAccount(identity, trustedEmail);
	}

	private getTrustedEmail(identity: OauthIdentity): string {
		if (!identity.email) {
			throw new OauthAuthenticationRefusedException(
				OAUTH_REFUSAL_REASON.MISSING_EMAIL
			);
		}

		if (!identity.isEmailVerified) {
			throw new OauthAuthenticationRefusedException(
				OAUTH_REFUSAL_REASON.UNVERIFIED_EMAIL
			);
		}

		return identity.email;
	}

	private async findLinkedUser(identity: OauthIdentity): Promise<User | null> {
		const oauthAuth = await OauthAuth.query()
			.where('provider', identity.provider)
			.andWhere('providerUserId', identity.providerUserId)
			.preload('user')
			.first();

		return oauthAuth?.user ?? null;
	}

	private async assertEmailIsAvailable(email: string): Promise<void> {
		const existingUser = await User.findBy('email', email);
		if (existingUser) {
			throw new OauthAuthenticationRefusedException(
				OAUTH_REFUSAL_REASON.EMAIL_ALREADY_REGISTERED
			);
		}
	}

	private async refreshProfile(
		user: User,
		identity: OauthIdentity
	): Promise<User> {
		user.merge({
			name: identity.name,
			nickName: identity.nickName,
			avatarUrl: identity.avatarUrl,
		});

		return user.save();
	}

	private async createAccount(
		identity: OauthIdentity,
		email: string
	): Promise<User> {
		return db.transaction(async (trx) => {
			const user = await User.create(
				{
					email,
					name: identity.name,
					nickName: identity.nickName,
					avatarUrl: identity.avatarUrl,
					isAdmin: await this.userService.isNextAccountAdmin(trx),
					emailVerifiedAt: DateTime.now(),
				},
				{ client: trx }
			);

			await user.related('oauthAuths').create({
				provider: identity.provider,
				providerUserId: identity.providerUserId,
				linkedAt: DateTime.now(),
			});

			return user;
		});
	}
}
