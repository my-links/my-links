import { DateTime } from 'luxon';
import db from '@adonisjs/lucid/services/db';
import { createHash, randomBytes } from 'node:crypto';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import OneTimeToken from '#models/one_time_token';
import {
	ONE_TIME_TOKEN_LIFETIME_HOURS,
	type OneTimeTokenType,
} from '#constants/auth';
import InvalidOneTimeTokenException from '#exceptions/auth/invalid_one_time_token_exception';

const TOKEN_BYTE_LENGTH = 32;

export type OneTimeTokenSubject = {
	readonly userId: number;
	readonly type: OneTimeTokenType;
};

export type IssuedOneTimeToken = {
	readonly plainToken: string;
	readonly expiresAt: DateTime;
	readonly lifetimeInHours: number;
};

export type OneTimeTokenPresentation = {
	readonly plainToken: string;
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
 */
export class OneTimeTokenService {
	async issue({
		userId,
		type,
	}: OneTimeTokenSubject): Promise<IssuedOneTimeToken> {
		const plainToken = randomBytes(TOKEN_BYTE_LENGTH).toString('base64url');
		const lifetimeInHours = ONE_TIME_TOKEN_LIFETIME_HOURS[type];
		const expiresAt = DateTime.now().plus({ hours: lifetimeInHours });

		await OneTimeToken.create({
			userId,
			type,
			tokenHash: digest(plainToken),
			expiresAt,
			consumedAt: null,
		});

		return { plainToken, expiresAt, lifetimeInHours };
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
		{ plainToken, type }: OneTimeTokenPresentation,
		applyAction: GuardedAction<TResult>
	): Promise<TResult> {
		return db.transaction(async (trx) => {
			const token = await OneTimeToken.query({ client: trx })
				.where('tokenHash', digest(plainToken))
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

function digest(plainToken: string): string {
	return createHash('sha256').update(plainToken).digest('hex');
}

function isUsable(token: OneTimeToken): boolean {
	return token.consumedAt === null && token.expiresAt > DateTime.now();
}
