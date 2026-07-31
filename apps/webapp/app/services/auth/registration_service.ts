import { DateTime } from 'luxon';
import { inject } from '@adonisjs/core';
import db from '@adonisjs/lucid/services/db';
import type { TransactionClientContract } from '@adonisjs/lucid/types/database';

import User from '#models/user';
import { UserService } from '#services/user/user_service';
import { PasswordHasher } from '#services/auth/password_hasher';
import { RegistrationPolicyService } from '#services/auth/registration_policy_service';

export type RegistrationRequest = {
	readonly name: string;
	readonly email: string;
	readonly password: string;
};

export type ProvisionRequest = RegistrationRequest & {
	readonly isAdmin: boolean;
};

type AccountIdentity = {
	readonly name: string;
	readonly email: string;
	readonly isAdmin: boolean;
	readonly emailVerifiedAt: DateTime | null;
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

		return db.transaction(async (trx) =>
			this.createAccount(trx, request.password, {
				name: request.name,
				email: request.email,
				isAdmin: await this.userService.isNextAccountAdmin(trx),
				emailVerifiedAt: null,
			})
		);
	}

	/**
	 * Opens an account on the operator's authority, from the console.
	 *
	 * Three things separate it from the visitor path, all following from who is
	 * asking: the registration policy decides who may walk in from the outside
	 * and has nothing to say about someone holding a shell on the machine; a
	 * taken address is reported plainly, because there is no visitor left to
	 * keep it from; and the address counts as confirmed, since an operator
	 * typing it is the very proof a mailed link would have collected.
	 */
	async provision(request: ProvisionRequest): Promise<User> {
		return db.transaction(async (trx) =>
			this.createAccount(trx, request.password, {
				name: request.name,
				email: request.email,
				isAdmin: request.isAdmin,
				emailVerifiedAt: DateTime.now(),
			})
		);
	}

	async isEmailAvailable(email: string): Promise<boolean> {
		return !(await this.isEmailTaken(email));
	}

	private async isEmailTaken(email: string): Promise<boolean> {
		const existingUser = await User.findBy('email', email);

		return existingUser !== null;
	}

	/**
	 * The single writer, shared by both paths. The account and its password are
	 * one write: a `users` row without a `password_auths` row is an account
	 * nobody — not even its owner — can sign in to, and nothing would ever
	 * repair it.
	 */
	private async createAccount(
		trx: TransactionClientContract,
		password: string,
		identity: AccountIdentity
	): Promise<User> {
		const user = await User.create(identity, { client: trx });

		await user.related('passwordAuth').create({ password });

		return user;
	}
}
