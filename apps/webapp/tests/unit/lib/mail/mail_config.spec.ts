import { test } from '@japa/runner';

import { resolveMailConfig, type MailSettings } from '#lib/mail/mail_config';
import IncompleteMailConfigException from '#exceptions/mail/incomplete_mail_config_exception';

const UNSET_MAIL_SETTINGS: MailSettings = {
	host: undefined,
	port: undefined,
	username: undefined,
	password: undefined,
	isSecure: undefined,
	fromAddress: undefined,
	fromName: undefined,
};

const MINIMAL_MAIL_SETTINGS: MailSettings = {
	...UNSET_MAIL_SETTINGS,
	host: 'smtp.example.com',
	fromAddress: 'no-reply@example.com',
};

const SUBMISSION_PORT = 587;
const IMPLICIT_TLS_PORT = 465;

test.group('resolveMailConfig', () => {
	test('should disable outgoing mail when no setting is provided', ({
		assert,
	}) => {
		const config = resolveMailConfig(UNSET_MAIL_SETTINGS);

		assert.deepEqual(config, { isEnabled: false });
	});

	test('should disable outgoing mail when every setting is an empty string', ({
		assert,
	}) => {
		const config = resolveMailConfig({
			...UNSET_MAIL_SETTINGS,
			host: '',
			username: '',
			password: '',
			fromAddress: '',
			fromName: '',
		});

		assert.deepEqual(config, { isEnabled: false });
	});

	test('should enable outgoing mail from a host and a sender address alone', ({
		assert,
	}) => {
		const config = resolveMailConfig(MINIMAL_MAIL_SETTINGS);

		assert.deepEqual(config, {
			isEnabled: true,
			host: 'smtp.example.com',
			port: SUBMISSION_PORT,
			isSecure: false,
			credentials: null,
			from: { address: 'no-reply@example.com', name: 'MyLinks' },
		});
	});

	test('should throw when the sender address is missing', ({ assert }) => {
		assert.throws(
			() =>
				resolveMailConfig({ ...UNSET_MAIL_SETTINGS, host: 'smtp.example.com' }),
			/MAIL_FROM_ADDRESS/
		);
	});

	test('should throw when the host is missing', ({ assert }) => {
		assert.throws(
			() =>
				resolveMailConfig({
					...UNSET_MAIL_SETTINGS,
					fromAddress: 'no-reply@example.com',
				}),
			/SMTP_HOST/
		);
	});

	test('should throw when a lone port betrays an unfinished configuration', ({
		assert,
	}) => {
		assert.throws(
			() =>
				resolveMailConfig({ ...UNSET_MAIL_SETTINGS, port: SUBMISSION_PORT }),
			/SMTP_HOST/
		);
	});

	test('should throw a typed exception on a partial configuration', ({
		assert,
	}) => {
		try {
			resolveMailConfig({ ...UNSET_MAIL_SETTINGS, host: 'smtp.example.com' });
			assert.fail('resolveMailConfig should have thrown');
		} catch (error) {
			assert.instanceOf(error, IncompleteMailConfigException);
		}
	});

	test('should turn on implicit TLS on the port that mandates it', ({
		assert,
	}) => {
		const config = resolveMailConfig({
			...MINIMAL_MAIL_SETTINGS,
			port: IMPLICIT_TLS_PORT,
		});

		assert.isTrue(config.isEnabled && config.isSecure);
	});

	test('should let the operator override implicit TLS', ({ assert }) => {
		const config = resolveMailConfig({
			...MINIMAL_MAIL_SETTINGS,
			port: IMPLICIT_TLS_PORT,
			isSecure: false,
		});

		assert.isFalse(config.isEnabled && config.isSecure);
	});

	test('should resolve the credentials when both are provided', ({
		assert,
	}) => {
		const config = resolveMailConfig({
			...MINIMAL_MAIL_SETTINGS,
			username: 'mailer',
			password: 'secret',
		});

		assert.deepEqual(config.isEnabled && config.credentials, {
			user: 'mailer',
			password: 'secret',
		});
	});

	test('should throw when the credentials password is missing', ({
		assert,
	}) => {
		assert.throws(
			() => resolveMailConfig({ ...MINIMAL_MAIL_SETTINGS, username: 'mailer' }),
			/SMTP_PASSWORD/
		);
	});

	test('should throw when the credentials username is missing', ({
		assert,
	}) => {
		assert.throws(
			() => resolveMailConfig({ ...MINIMAL_MAIL_SETTINGS, password: 'secret' }),
			/SMTP_USERNAME/
		);
	});

	test('should fall back to the default sender name when it is left blank', ({
		assert,
	}) => {
		const config = resolveMailConfig({
			...MINIMAL_MAIL_SETTINGS,
			fromName: '',
		});

		assert.deepEqual(config.isEnabled && config.from, {
			address: 'no-reply@example.com',
			name: 'MyLinks',
		});
	});

	test('should keep the sender name provided by the operator', ({ assert }) => {
		const config = resolveMailConfig({
			...MINIMAL_MAIL_SETTINGS,
			fromName: 'Bookmarks',
		});

		assert.deepEqual(config.isEnabled && config.from, {
			address: 'no-reply@example.com',
			name: 'Bookmarks',
		});
	});
});
