import { test } from '@japa/runner';

import User from '#models/user';
import PasswordSetNotification from '#mails/password_set_notification';

function buildUser(): User {
	const user = new User();
	user.email = 'reader@example.com';
	user.name = 'Ada';

	return user;
}

test.group('PasswordSetNotification', () => {
	test('should address the email to the account that gained a password', async () => {
		const notification = new PasswordSetNotification({ user: buildUser() });

		await notification.buildWithContents();

		notification.message.assertTo('reader@example.com');
	});

	test('should say nothing was signed out, unlike a password change', async () => {
		const notification = new PasswordSetNotification({ user: buildUser() });

		await notification.buildWithContents();

		notification.message.assertHtmlIncludes('still signed in everywhere');
	});
});
