import { test } from '@japa/runner';

import User from '#models/user';
import ResetPasswordNotification from '#mails/reset_password_notification';

const RESET_URL = 'https://links.example.com/reset-password?token=abc';
const EXPIRES_IN_HOURS = 1;

function buildUser(): User {
	const user = new User();
	user.email = 'reader@example.com';
	user.name = 'Ada';

	return user;
}

test.group('ResetPasswordNotification', () => {
	test('should address the email to the account being recovered', async () => {
		const notification = new ResetPasswordNotification({
			user: buildUser(),
			resetUrl: RESET_URL,
			expiresInHours: EXPIRES_IN_HOURS,
		});

		await notification.buildWithContents();

		notification.message.assertTo('reader@example.com');
	});

	test('should carry the reset link in the body', async () => {
		const notification = new ResetPasswordNotification({
			user: buildUser(),
			resetUrl: RESET_URL,
			expiresInHours: EXPIRES_IN_HOURS,
		});

		await notification.buildWithContents();

		notification.message.assertHtmlIncludes(RESET_URL);
	});

	test('should tell the reader to ignore the email when they did not ask for it', async () => {
		const notification = new ResetPasswordNotification({
			user: buildUser(),
			resetUrl: RESET_URL,
			expiresInHours: EXPIRES_IN_HOURS,
		});

		await notification.buildWithContents();

		notification.message.assertHtmlIncludes('ignore this email');
	});
});
