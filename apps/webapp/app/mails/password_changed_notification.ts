import { BaseMail } from '@adonisjs/mail';

import type User from '#models/user';

export type PasswordChangedPayload = {
	readonly user: User;
};

export default class PasswordChangedNotification extends BaseMail {
	subject = 'Your password was changed';

	constructor(protected readonly payload: PasswordChangedPayload) {
		super();
	}

	prepare(): void {
		const { user } = this.payload;

		this.message
			.to(user.email)
			.htmlView('emails/password_changed', { name: user.name });
	}
}
