import { BaseMail } from '@adonisjs/mail';

import type User from '#models/user';

export type EmailChangeRequestedPayload = {
	readonly user: User;
	readonly newEmailAddress: string;
	readonly cancellationUrl: string;
	readonly expiresInHours: number;
};

/**
 * Goes to the address the account is leaving, and carries the veto.
 *
 * This is the safety net for a stolen session: the thief can reach the settings
 * form, but the only mailbox told about it is the one they do not have, and the
 * link in here both stops the change and signs every session out.
 */
export default class EmailChangeRequestedNotification extends BaseMail {
	subject = 'Your email address is about to change';

	constructor(protected readonly payload: EmailChangeRequestedPayload) {
		super();
	}

	prepare(): void {
		const { user, newEmailAddress, cancellationUrl, expiresInHours } =
			this.payload;

		this.message.to(user.email).htmlView('emails/email_change_requested', {
			name: user.name,
			newEmailAddress,
			cancellationUrl,
			expiresInHours,
		});
	}
}
