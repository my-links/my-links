import { inject } from '@adonisjs/core';

import User from '#models/user';
import { PasswordHasher } from '#services/auth/password_hasher';
import InvalidCredentialsException from '#exceptions/auth/invalid_credentials_exception';

const DECOY_PLAIN_PASSWORD = 'this-password-belongs-to-nobody';

@inject()
export class CredentialsAuthService {
	private decoyHash: Promise<string> | null = null;

	constructor(protected readonly passwordHasher: PasswordHasher) {}

	/**
	 * Resolves an email and password pair to the account it unlocks.
	 *
	 * Returning early when the account is missing would make the sign-in form
	 * an enumeration oracle: an unknown email would answer in a millisecond
	 * where a known one spends the argon2 budget. Both paths therefore run one
	 * verification before failing with the very same exception.
	 */
	async verifyCredentials(email: string, plainPassword: string): Promise<User> {
		const user = await this.findUserWithPassword(email);

		if (!user?.passwordAuth) {
			await this.verifyAgainstDecoy(plainPassword);
			throw new InvalidCredentialsException();
		}

		const isPasswordValid = await this.passwordHasher.verify(
			user.passwordAuth.password,
			plainPassword
		);

		if (!isPasswordValid) {
			throw new InvalidCredentialsException();
		}

		return user;
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
