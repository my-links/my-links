import { test } from '@japa/runner';

import User from '#models/user';
import VerifyEmailNotification from '#mails/verify_email_notification';

const VERIFICATION_URL = 'https://links.example.com/verify-email?token=abc';
const EXPIRES_IN_HOURS = 24;

function buildUser(): User {
	const user = new User();
	user.email = 'reader@example.com';
	user.name = 'Ada';

	return user;
}

test.group('VerifyEmailNotification', () => {
	test('should address the email to the account being verified', async () => {
		const notification = new VerifyEmailNotification({
			user: buildUser(),
			verificationUrl: VERIFICATION_URL,
			expiresInHours: EXPIRES_IN_HOURS,
		});

		await notification.buildWithContents();

		notification.message.assertTo('reader@example.com');
	});

	test('should carry the verification link in the body', async () => {
		const notification = new VerifyEmailNotification({
			user: buildUser(),
			verificationUrl: VERIFICATION_URL,
			expiresInHours: EXPIRES_IN_HOURS,
		});

		await notification.buildWithContents();

		notification.message.assertHtmlIncludes(VERIFICATION_URL);
	});

	test('should state how long the link stays valid', async () => {
		const notification = new VerifyEmailNotification({
			user: buildUser(),
			verificationUrl: VERIFICATION_URL,
			expiresInHours: EXPIRES_IN_HOURS,
		});

		await notification.buildWithContents();

		notification.message.assertHtmlIncludes(`${EXPIRES_IN_HOURS} hours`);
	});
});
