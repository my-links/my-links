import { BaseMail } from '@adonisjs/mail';

import type User from '#models/user';

export type ResetPasswordPayload = {
	readonly user: User;
	readonly resetUrl: string;
	readonly expiresInHours: number;
};

export default class ResetPasswordNotification extends BaseMail {
	subject = 'Reset your password';

	constructor(protected readonly payload: ResetPasswordPayload) {
		super();
	}

	prepare(): void {
		const { user, resetUrl, expiresInHours } = this.payload;

		this.message.to(user.email).htmlView('emails/reset_password', {
			name: user.name,
			resetUrl,
			expiresInHours,
		});
	}
}
