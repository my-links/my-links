import app from '@adonisjs/core/services/app';
import mail from '@adonisjs/mail/services/main';

import { MailConfigService } from '#services/mail/mail_config_service';

type FakeMailer = ReturnType<typeof mail.fake>;

let fakeMailer: FakeMailer | null = null;

/**
 * Turns outgoing mail on for a group and captures what it sends.
 *
 * The suite runs with every SMTP variable blank, so a flow that mails
 * something is simply disabled by default. Enabling it without faking the
 * mailer would push each message through the real transport — a DNS lookup for
 * an unreachable host on every test that registers, resets or verifies.
 */
export function enableOutgoingMail() {
	app.container.swap(MailConfigService, () => ({ isEnabled: true }));
	fakeMailer = mail.fake();

	return () => {
		mail.restore();
		app.container.restore(MailConfigService);
		fakeMailer = null;
	};
}

/**
 * The captured queue. Fails loudly rather than silently asserting against an
 * empty fake when a group forgot to enable outgoing mail.
 */
export function queuedMails(): FakeMailer['mails'] {
	if (!fakeMailer) {
		throw new Error('enableOutgoingMail() was not set up for this group');
	}

	return fakeMailer.mails;
}
