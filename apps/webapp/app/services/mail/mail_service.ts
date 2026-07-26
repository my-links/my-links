import { inject } from '@adonisjs/core';
import type { BaseMail } from '@adonisjs/mail';
import mail from '@adonisjs/mail/services/main';
import logger from '@adonisjs/core/services/logger';

import { MailConfigService } from '#services/mail/mail_config_service';

@inject()
export class MailService {
	constructor(protected readonly mailConfig: MailConfigService) {}

	get isEnabled(): boolean {
		return this.mailConfig.isEnabled;
	}

	/**
	 * Hands the notification to the background queue, or records that it was
	 * dropped.
	 *
	 * Queueing rather than awaiting delivery keeps an SMTP round trip out of the
	 * request, which also keeps the response time of "an account exists" and
	 * "it does not" indistinguishable on the flows that must not answer that
	 * question. Delivery failures surface through `queued:mail:error`.
	 */
	async send(notification: BaseMail): Promise<void> {
		if (!this.isEnabled) {
			logger.warn(
				{ notification: notification.constructor.name },
				'Outgoing mail is disabled on this instance — email dropped'
			);

			return;
		}

		await mail.sendLater(notification);
	}
}
