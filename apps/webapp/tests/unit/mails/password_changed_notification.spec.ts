import { test } from '@japa/runner';

import User from '#models/user';
import PasswordChangedNotification from '#mails/password_changed_notification';

function buildUser(): User {
	const user = new User();
	user.email = 'reader@example.com';
	user.name = 'Ada';

	return user;
}

test.group('PasswordChangedNotification', () => {
	test('should address the email to the account whose password changed', async () => {
		const notification = new PasswordChangedNotification({
			user: buildUser(),
		});

		await notification.buildWithContents();

		notification.message.assertTo('reader@example.com');
	});

	test('should carry no action link, since it only reports a completed change', async () => {
		const notification = new PasswordChangedNotification({
			user: buildUser(),
		});

		await notification.buildWithContents();

		notification.message.assertHtmlIncludes('did not make this change');
	});
});
