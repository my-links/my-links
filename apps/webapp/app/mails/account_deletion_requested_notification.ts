import { BaseMail } from '@adonisjs/mail';
import { urlFor } from '@adonisjs/core/services/url_builder';

import env from '#start/env';
import type User from '#models/user';
import type { AccountDeletionReason } from '#constants/account';

export type AccountDeletionRequestedPayload = {
	readonly user: User;
	readonly gracePeriodDays: number;
	readonly reason: AccountDeletionReason;
};

/**
 * The safety net for a misclick, or for an account the inactivity sweep
 * flagged on nobody's behalf: confirms the request landed, and states
 * plainly that logging back in during the grace period is how to undo it —
 * the login flow itself is what asks for that confirmation, this mail just
 * has to point back at it. `reason` only changes the opening line: an
 * account nobody asked to delete should never read "your request".
 */
export default class AccountDeletionRequestedNotification extends BaseMail {
	subject = 'Your account is scheduled for deletion';

	constructor(protected readonly payload: AccountDeletionRequestedPayload) {
		super();
	}

	prepare(): void {
		const { user, gracePeriodDays, reason } = this.payload;

		this.message.to(user.email).htmlView('emails/account_deletion_requested', {
			name: user.name,
			gracePeriodDays,
			reason,
			loginUrl: urlFor('auth.login', undefined, {
				prefixUrl: env.get('APP_URL'),
			}),
		});
	}
}
