import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import mail from '@adonisjs/mail/services/main';
import testUtils from '@adonisjs/core/services/test_utils';

import { MailService } from '#services/mail/mail_service';
import { createUser } from '#tests/factories/user_factory';
import { MailConfigService } from '#services/mail/mail_config_service';
import PasswordChangedNotification from '#mails/password_changed_notification';

function enableOutgoingMail() {
	app.container.swap(MailConfigService, () => ({ isEnabled: true }));
}

test.group('Outgoing mail — disabled', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should boot with outgoing mail disabled when no smtp variable is set', async ({
		assert,
	}) => {
		const mailService = await app.container.make(MailService);

		assert.isFalse(mailService.isEnabled);
	});

	test('should drop the email instead of queueing it when outgoing mail is disabled', async () => {
		const fakeMailer = mail.fake();
		const user = await createUser({ emailPrefix: 'mail-disabled' });
		const mailService = await app.container.make(MailService);

		await mailService.send(new PasswordChangedNotification({ user }));

		fakeMailer.mails.assertNoneQueued();
	}).teardown(() => mail.restore());
});

test.group('Outgoing mail — enabled', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());
	group.each.setup(() => {
		enableOutgoingMail();
		return () => app.container.restore(MailConfigService);
	});

	test('should queue the email when outgoing mail is enabled', async () => {
		const fakeMailer = mail.fake();
		const user = await createUser({ emailPrefix: 'mail-enabled' });
		const mailService = await app.container.make(MailService);

		await mailService.send(new PasswordChangedNotification({ user }));

		fakeMailer.mails.assertQueued(PasswordChangedNotification);
	}).teardown(() => mail.restore());

	test('should address the email to the account it concerns', async () => {
		const fakeMailer = mail.fake();
		const user = await createUser({ emailPrefix: 'mail-recipient' });
		const mailService = await app.container.make(MailService);

		await mailService.send(new PasswordChangedNotification({ user }));

		fakeMailer.mails.assertQueued(PasswordChangedNotification, (queued) => {
			queued.message.assertTo(user.email);
			return true;
		});
	}).teardown(() => mail.restore());
});
