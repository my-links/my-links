import { test } from '@japa/runner';

import User from '#models/user';
import EmailChangeConfirmation from '#mails/email_change_confirmation';

const NEW_EMAIL_ADDRESS = 'ada-new@example.com';
const CONFIRMATION_URL = 'https://links.example.com/confirm-email?token=abc';
const EXPIRES_IN_HOURS = 1;

function buildUser(): User {
	const user = new User();
	user.email = 'reader@example.com';
	user.name = 'Ada';

	return user;
}

function buildNotification(): EmailChangeConfirmation {
	return new EmailChangeConfirmation({
		user: buildUser(),
		newEmailAddress: NEW_EMAIL_ADDRESS,
		confirmationUrl: CONFIRMATION_URL,
		expiresInHours: EXPIRES_IN_HOURS,
	});
}

test.group('EmailChangeConfirmation', () => {
	test('should address the email to the new address rather than the current one', async () => {
		const notification = buildNotification();

		await notification.buildWithContents();

		notification.message.assertTo(NEW_EMAIL_ADDRESS);
	});

	test('should carry the confirmation link in the body', async () => {
		const notification = buildNotification();

		await notification.buildWithContents();

		notification.message.assertHtmlIncludes(CONFIRMATION_URL);
	});

	test('should name the address the change moves to', async () => {
		const notification = buildNotification();

		await notification.buildWithContents();

		notification.message.assertHtmlIncludes(NEW_EMAIL_ADDRESS);
	});
});
