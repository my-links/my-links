import { test } from '@japa/runner';

import { toLoggableUrl } from '#lib/logging/loggable_url';

const VERIFICATION_TOKEN = 'CxwXBGT0kkR8Vf4l0nqzsGnLgbZDPdlkQmVDDGYOgHY';

test.group('Loggable URL', () => {
	test('should keep a token out of what gets recorded', ({ assert }) => {
		const loggableUrl = toLoggableUrl(`/verify-email/${VERIFICATION_TOKEN}`);

		assert.notInclude(loggableUrl, VERIFICATION_TOKEN);
	});

	test('should still say which route was reached', ({ assert }) => {
		const loggableUrl = toLoggableUrl(`/verify-email/${VERIFICATION_TOKEN}`);

		assert.equal(loggableUrl, '/verify-email/[redacted]');
	});

	test('should keep a password reset token out of what gets recorded', ({
		assert,
	}) => {
		const loggableUrl = toLoggableUrl(`/reset-password/${VERIFICATION_TOKEN}`);

		assert.equal(loggableUrl, '/reset-password/[redacted]');
	});

	test('should leave a URL carrying no secret untouched', ({ assert }) => {
		assert.equal(toLoggableUrl('/collections/42'), '/collections/42');
	});
});
