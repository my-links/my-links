import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import OauthAuth from '#models/oauth_auth';
import type { AuthProvider } from '#constants/auth';
import { PasswordService } from '#services/auth/password_service';
import type { OauthIdentity } from '#services/auth/oauth_account_service';
import { OauthAccountService } from '#services/auth/oauth_account_service';
import LastAuthMethodException from '#exceptions/auth/last_auth_method_exception';
import ProviderLinkRefusedException, {
	PROVIDER_LINK_REFUSAL,
} from '#exceptions/auth/provider_link_refused_exception';

/**
 * Everything an account can prove itself with, as the settings page needs to
 * state it.
 */
export type AuthMethodsDescription = {
	readonly hasPassword: boolean;
	readonly linkedProviders: OauthAuth[];
	readonly isAnyProviderUnlinkable: boolean;
};

/**
 * Attaching a second way into an account, and taking one away.
 *
 * Linking deliberately ignores the email the provider hands over: the round
 * trip proved control of the provider account, which is the only claim being
 * recorded, and the address is never read from a link. That is also why an
 * unverified provider email is no obstacle here while it refuses a sign-in —
 * signing in is where an address decides which account is reached.
 */
@inject()
export class ProviderLinkService {
	constructor(
		protected readonly passwordService: PasswordService,
		protected readonly oauthAccountService: OauthAccountService
	) {}

	async describeAuthMethods(user: User): Promise<AuthMethodsDescription> {
		const [hasPassword, linkedProviders] = await Promise.all([
			this.passwordService.hasPassword(user),
			this.listLinkedProviders(user),
		]);

		return {
			hasPassword,
			linkedProviders,
			isAnyProviderUnlinkable:
				countMethods(hasPassword, linkedProviders.length) > 1,
		};
	}

	/**
	 * Records an identity a completed round trip just proved, on the account
	 * that asked for it.
	 */
	async link(user: User, identity: OauthIdentity): Promise<OauthAuth> {
		const currentOwner =
			await this.oauthAccountService.findLinkedUser(identity);
		if (currentOwner) {
			throw new ProviderLinkRefusedException(
				currentOwner.id === user.id
					? PROVIDER_LINK_REFUSAL.ALREADY_LINKED
					: PROVIDER_LINK_REFUSAL.LINKED_TO_ANOTHER_ACCOUNT
			);
		}

		const isProviderTaken = await this.oauthAccountService.hasLinkedProvider(
			user,
			identity.provider
		);
		if (isProviderTaken) {
			throw new ProviderLinkRefusedException(
				PROVIDER_LINK_REFUSAL.PROVIDER_SLOT_TAKEN
			);
		}

		return user.related('oauthAuths').create({
			provider: identity.provider,
			providerUserId: identity.providerUserId,
			linkedAt: DateTime.now(),
		});
	}

	/**
	 * Detaches a provider, unless it is the last way in.
	 *
	 * The account row is locked for the whole transaction: two unlinks racing
	 * on an account with exactly two providers would otherwise each count the
	 * method the other is about to delete, and both would be allowed.
	 */
	async unlink(user: User, provider: AuthProvider): Promise<void> {
		await db.transaction(async (trx) => {
			await User.query({ client: trx })
				.where('id', user.id)
				.forUpdate()
				.firstOrFail();

			const link = await OauthAuth.query({ client: trx })
				.where('userId', user.id)
				.andWhere('provider', provider)
				.first();
			if (!link) {
				throw new ProviderLinkRefusedException(
					PROVIDER_LINK_REFUSAL.NOT_LINKED
				);
			}

			const [hasPassword, linkedProviders] = await Promise.all([
				this.passwordService.hasPassword(user, trx),
				this.listLinkedProviders(user, trx),
			]);
			const remainingMethods =
				countMethods(hasPassword, linkedProviders.length) - 1;
			if (remainingMethods === 0) {
				throw new LastAuthMethodException();
			}

			await link.useTransaction(trx).delete();
		});
	}

	private listLinkedProviders(
		user: User,
		trx?: TransactionClientContract
	): Promise<OauthAuth[]> {
		return OauthAuth.query({ client: trx })
			.where('userId', user.id)
			.orderBy('linkedAt', 'asc');
	}
}

function countMethods(hasPassword: boolean, providerCount: number): number {
	return (hasPassword ? 1 : 0) + providerCount;
}
