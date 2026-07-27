import { DateTime } from 'luxon';
import { createHash } from 'node:crypto';
import db from '@adonisjs/lucid/services/db';
import { Secret, VerificationToken } from '@adonisjs/core/helpers';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import OneTimeToken from '#models/one_time_token';
import {
	ONE_TIME_TOKEN_LIFETIME_HOURS,
	type OneTimeTokenType,
} from '#constants/auth';
import InvalidOneTimeTokenException from '#exceptions/auth/invalid_one_time_token_exception';

/**
 * Counted in characters, not bytes — that is what `VerificationToken.seed`
 * takes, and reading it as a byte count is how a token silently ends up
 * weaker than intended. 43 base64url characters carry the same 256 bits as the
 * 32 random bytes they encode.
 */
const TOKEN_CHARACTER_LENGTH = 43;

export type OneTimeTokenSubject = {
	readonly userId: number;
	readonly type: OneTimeTokenType;
};

export type IssuedOneTimeToken = {
	readonly secret: Secret<string>;
	readonly expiresAt: DateTime;
	readonly lifetimeInHours: number;
};

export type OneTimeTokenPresentation = {
	readonly secret: Secret<string>;
	readonly type: OneTimeTokenType;
};

/**
 * The work a token authorizes, run inside the very transaction that burns it.
 */
export type GuardedAction<TResult> = (
	token: OneTimeToken,
	trx: TransactionClientContract
) => Promise<TResult>;

/**
 * Single-use links for the flows that have to reach an account through its
 * mailbox.
 *
 * Only `sha256(token)` is persisted. The value already carries 256 bits of
 * entropy, so a slow hash would buy nothing a dictionary could threaten while
 * making the column unindexable — but a plain-text column would hand every
 * outstanding link to anyone who reads a database backup.
 *
 * The clear value never travels as a bare string. `Secret` renders as
 * `[redacted]` through `String()`, template interpolation and
 * `JSON.stringify`, so the one line of logging somebody adds later cannot
 * print a live link.
 */
export class OneTimeTokenService {
	async issue({
		userId,
		type,
	}: OneTimeTokenSubject): Promise<IssuedOneTimeToken> {
		const { secret, hash } = VerificationToken.seed(TOKEN_CHARACTER_LENGTH);
		const lifetimeInHours = ONE_TIME_TOKEN_LIFETIME_HOURS[type];
		const expiresAt = DateTime.now().plus({ hours: lifetimeInHours });

		await OneTimeToken.create({
			userId,
			type,
			tokenHash: hash,
			expiresAt,
			consumedAt: null,
		});

		return { secret, expiresAt, lifetimeInHours };
	}

	/**
	 * Burns the token and runs the action it authorizes as one transaction.
	 *
	 * There is no way to consume a token without an action, and no way to run
	 * the action without consuming the token: an interrupted request therefore
	 * leaves the link usable rather than spent on nothing. The row is locked for
	 * the duration so two clicks on the same link — a mail client prefetching it
	 * while its owner clicks — cannot both get through.
	 */
	async consume<TResult>(
		{ secret, type }: OneTimeTokenPresentation,
		applyAction: GuardedAction<TResult>
	): Promise<TResult> {
		return db.transaction(async (trx) => {
			const token = await OneTimeToken.query({ client: trx })
				.where('tokenHash', digest(secret))
				.andWhere('type', type)
				.forUpdate()
				.first();

			if (!token || !isUsable(token)) {
				throw new InvalidOneTimeTokenException();
			}

			token.consumedAt = DateTime.now();
			await token.useTransaction(trx).save();

			return applyAction(token, trx);
		});
	}

	/**
	 * Retires every outstanding token of a purpose. Issuing a new link has to
	 * revoke the previous one, and a password change has to revoke the reset
	 * links that were in flight when it happened.
	 */
	async invalidateAll({ userId, type }: OneTimeTokenSubject): Promise<void> {
		await OneTimeToken.query()
			.where('userId', userId)
			.andWhere('type', type)
			.whereNull('consumedAt')
			.update({ consumed_at: DateTime.now().toSQL() });
	}
}

/**
 * Recomputes what `VerificationToken.seed` stored, so a presented token can be
 * found by an indexed lookup instead of a scan-and-compare. It has to stay the
 * same digest `seed` produces; a divergence breaks every redemption at once,
 * which is what the specs here are for.
 */
function digest(secret: Secret<string>): string {
	return createHash('sha256').update(secret.release()).digest('hex');
}

function isUsable(token: OneTimeToken): boolean {
	return token.consumedAt === null && token.expiresAt > DateTime.now();
}
