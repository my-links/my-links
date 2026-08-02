import { errors } from '@adonisjs/auth';
import { inject } from '@adonisjs/core';

import User from '#models/user';
import type { RequestOrigin } from '#lib/request_origin';
import { PasswordHasher } from '#services/auth/password_hasher';
import { AuthEventService } from '#services/auth/auth_event_service';

const DECOY_PLAIN_PASSWORD = 'this-password-belongs-to-nobody';

/**
 * One wording for a wrong password and for an email nobody ever registered.
 * A message that varies with the cause tells an attacker which addresses are
 * worth a dictionary run.
 */
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email address or password';

export type CredentialsAttempt = {
	readonly email: string;
	readonly password: string;
	readonly origin: RequestOrigin;
};

@inject()
export class CredentialsAuthService {
	private decoyHash: Promise<string> | null = null;

	constructor(
		protected readonly passwordHasher: PasswordHasher,
		protected readonly authEventService: AuthEventService
	) {}

	/**
	 * Resolves an email and password pair to the account it unlocks.
	 *
	 * Returning early when the account is missing would make the sign-in form
	 * an enumeration oracle: an unknown email would answer in a millisecond
	 * where a known one spends the argon2 budget. Both paths therefore run one
	 * verification before failing with the very same exception.
	 *
	 * `E_INVALID_CREDENTIALS` renders itself — message flashed, submitted input
	 * kept, redirect back — so no caller has to catch it to build a form error.
	 */
	async verifyCredentials({
		email,
		password,
		origin,
	}: CredentialsAttempt): Promise<User> {
		const user = await this.findUserWithPassword(email);

		if (!user?.passwordAuth) {
			await this.verifyAgainstDecoy(password);
			return this.refuse(email, origin);
		}

		const isPasswordValid = await this.passwordHasher.verify(
			user.passwordAuth.password,
			password
		);

		if (!isPasswordValid) {
			return this.refuse(email, origin);
		}

		return user;
	}

	/**
	 * Journals the attempt from here rather than from the controller: the
	 * refusal travels as an exception nobody catches, so this is the last place
	 * that still knows an attempt failed.
	 */
	private async refuse(email: string, origin: RequestOrigin): Promise<never> {
		await this.authEventService.recordFailedLogin({ email, ...origin });

		throw new errors.E_INVALID_CREDENTIALS(INVALID_CREDENTIALS_MESSAGE);
	}

	private findUserWithPassword(email: string): Promise<User | null> {
		return User.query().where('email', email).preload('passwordAuth').first();
	}

	/**
	 * The decoy is hashed once and reused: it has to come from the live hasher
	 * config, or a later tuning of the argon2 parameters would silently
	 * reintroduce the timing gap a hard-coded digest was meant to close.
	 */
	private async verifyAgainstDecoy(plainPassword: string): Promise<void> {
		this.decoyHash ??= this.passwordHasher.make(DECOY_PLAIN_PASSWORD);

		await this.passwordHasher.verify(await this.decoyHash, plainPassword);
	}
}
