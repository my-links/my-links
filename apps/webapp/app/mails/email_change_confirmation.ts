import { BaseMail } from '@adonisjs/mail';

export type EmailChangeConfirmationPayload = {
	readonly newEmailAddress: string;
	readonly confirmationUrl: string;
	readonly expiresInHours: number;
};

/**
 * Goes to the address the account is moving to: it is the only address that
 * can prove the change was asked for by someone who owns it.
 */
export class EmailChangeConfirmation extends BaseMail {
	subject = 'Confirm your new email address';

	constructor(protected readonly payload: EmailChangeConfirmationPayload) {
		super();
	}

	prepare(): void {
		const { newEmailAddress, confirmationUrl, expiresInHours } = this.payload;

		this.message
			.to(newEmailAddress)
			.htmlView('emails/email_change_confirmation', {
				newEmailAddress,
				confirmationUrl,
				expiresInHours,
			});
	}
}
