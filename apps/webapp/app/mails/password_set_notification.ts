import { BaseMail } from '@adonisjs/mail';

import type User from '#models/user';

export type PasswordSetPayload = {
	readonly user: User;
};

/**
 * Distinct from `PasswordChangedNotification` because the two describe
 * different aftermaths: adding a first password revokes nothing, changing one
 * signs every other session and extension token out. One class covering both
 * would have to lie in one of the two cases.
 */
export default class PasswordSetNotification extends BaseMail {
	subject = 'A password was added to your account';

	constructor(protected readonly payload: PasswordSetPayload) {
		super();
	}

	prepare(): void {
		const { user } = this.payload;

		this.message
			.to(user.email)
			.htmlView('emails/password_set', { name: user.name });
	}
}
