import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';

import User from '#models/user';
import { UserService } from '#services/user/user_service';
import { PasswordHasher } from '#services/auth/password_hasher';
import { RegistrationPolicyService } from '#services/auth/registration_policy_service';

export type RegistrationRequest = {
	readonly name: string;
	readonly email: string;
	readonly password: string;
};

@inject()
export class RegistrationService {
	constructor(
		protected readonly registrationPolicyService: RegistrationPolicyService,
		protected readonly userService: UserService,
		protected readonly passwordHasher: PasswordHasher
	) {}

	/**
	 * Opens an account for a visitor, or does nothing when the address already
	 * belongs to someone.
	 *
	 * `null` says "the address was taken" to the caller and to nobody else: the
	 * response is the same either way, or the form would answer which addresses
	 * have an account. That includes the response *time*, which is why the taken
	 * path still spends one argon2 budget instead of returning straight away.
	 */
	async register(request: RegistrationRequest): Promise<User | null> {
		await this.registrationPolicyService.assertIsOpen();

		if (await this.isEmailTaken(request.email)) {
			await this.passwordHasher.make(request.password);

			return null;
		}

		return this.createAccount(request);
	}

	private async isEmailTaken(email: string): Promise<boolean> {
		const existingUser = await User.findBy('email', email);

		return existingUser !== null;
	}

	/**
	 * The account and its password are one write: a `users` row without a
	 * `password_auths` row is an account nobody — not even its owner — can sign
	 * in to, and nothing would ever repair it.
	 */
	private async createAccount({
		name,
		email,
		password,
	}: RegistrationRequest): Promise<User> {
		return db.transaction(async (trx) => {
			const user = await User.create(
				{
					name,
					email,
					isAdmin: await this.userService.isNextAccountAdmin(trx),
					emailVerifiedAt: null,
				},
				{ client: trx }
			);

			await user.related('passwordAuth').create({ password });

			return user;
		});
	}
}
