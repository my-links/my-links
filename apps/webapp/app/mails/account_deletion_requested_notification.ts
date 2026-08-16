import { BaseMail } from '@adonisjs/mail';
import { urlFor } from '@adonisjs/core/services/url_builder';

import env from '#start/env';
import type User from '#models/user';

export type AccountDeletionRequestedPayload = {
	readonly user: User;
	readonly gracePeriodDays: number;
};

/**
 * The safety net for a misclick: confirms the request landed, and states
 * plainly that logging back in during the grace period is how to undo it —
 * the login flow itself is what asks for that confirmation, this mail just
 * has to point back at it.
 */
export default class AccountDeletionRequestedNotification extends BaseMail {
	subject = 'Your account is scheduled for deletion';

	constructor(protected readonly payload: AccountDeletionRequestedPayload) {
		super();
	}

	prepare(): void {
		const { user, gracePeriodDays } = this.payload;

		this.message.to(user.email).htmlView('emails/account_deletion_requested', {
			name: user.name,
			gracePeriodDays,
			loginUrl: urlFor('auth.login', undefined, {
				prefixUrl: env.get('APP_URL'),
			}),
		});
	}
}
