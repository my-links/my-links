import { test } from '@japa/runner';

import { buildServerErrorProps } from '#lib/errors/server_error_props';

const SENSITIVE_DETAIL = 'Key (email)=(someone@example.com) already exists.';
const SENSITIVE_MESSAGE =
	'insert into "users" ("email") values ($1) - duplicate key value';

function buildDatabaseError() {
	return Object.assign(new Error(SENSITIVE_MESSAGE), {
		status: 500,
		detail: SENSITIVE_DETAIL,
		table: 'users',
		constraint: 'users_email_unique',
	});
}

test.group('buildServerErrorProps in production', () => {
	test('should keep the error message out of the props', ({ assert }) => {
		const props = buildServerErrorProps(buildDatabaseError(), true);

		assert.notInclude(JSON.stringify(props), SENSITIVE_MESSAGE);
	});

	test('should keep the error detail out of the props', ({ assert }) => {
		const props = buildServerErrorProps(buildDatabaseError(), true);

		assert.notInclude(JSON.stringify(props), SENSITIVE_DETAIL);
	});

	test('should keep the constraint and table out of the props', ({
		assert,
	}) => {
		const serializedProps = JSON.stringify(
			buildServerErrorProps(buildDatabaseError(), true)
		);

		assert.notMatch(serializedProps, /users_email_unique|users"/);
	});

	test('should expose only the status', ({ assert }) => {
		const props = buildServerErrorProps(buildDatabaseError(), true);

		assert.deepEqual(props, { error: { status: 500 } });
	});

	test('should default the status to 500 when the error has none', ({
		assert,
	}) => {
		const props = buildServerErrorProps(new Error('boom'), true);

		assert.equal(props.error.status, 500);
	});
});

test.group('buildServerErrorProps outside production', () => {
	test('should expose the error message to help debugging', ({ assert }) => {
		const props = buildServerErrorProps(buildDatabaseError(), false);

		assert.equal(props.error.message, SENSITIVE_MESSAGE);
	});

	test('should never expose the error detail', ({ assert }) => {
		const props = buildServerErrorProps(buildDatabaseError(), false);

		assert.notInclude(JSON.stringify(props), SENSITIVE_DETAIL);
	});
});
