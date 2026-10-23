import { test } from '@japa/runner';

import { PasswordSetNotification } from '#mails/password_set_notification';
import User from '#models/user';

const ACCOUNT_NAME = 'Mallory Phisher';

function buildUser(): User {
	const user = new User();
	user.email = 'reader@example.com';
	user.name = ACCOUNT_NAME;

	return user;
}

test.group('PasswordSetNotification', () => {
	test('should not greet the account by the name it chose', async ({
		assert,
	}) => {
		const notification = new PasswordSetNotification({ user: buildUser() });

		await notification.buildWithContents();

		assert.notInclude(
			notification.message.toJSON().message.html ?? '',
			ACCOUNT_NAME
		);
	});

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
