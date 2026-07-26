import { BaseMail } from '@adonisjs/mail';

import type User from '#models/user';

export type VerifyEmailPayload = {
	readonly user: User;
	readonly verificationUrl: string;
	readonly expiresInHours: number;
};

export default class VerifyEmailNotification extends BaseMail {
	subject = 'Verify your email address';

	constructor(protected readonly payload: VerifyEmailPayload) {
		super();
	}

	prepare(): void {
		const { user, verificationUrl, expiresInHours } = this.payload;

		this.message.to(user.email).htmlView('emails/verify_email', {
			name: user.name,
			verificationUrl,
			expiresInHours,
		});
	}
}
