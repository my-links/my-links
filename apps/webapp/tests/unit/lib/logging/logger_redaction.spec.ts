import { test } from '@japa/runner';
import logger from '@adonisjs/core/services/logger';

import {
	clearCapturedLogs,
	readAlwaysOnLogs,
} from '#tests/helpers/captured_logs';

const CONSTRAINT_DETAIL = 'Key (email)=(someone@example.com) already exists.';

class ConstraintViolationError extends Error {
	readonly code = '23505';
	readonly detail = CONSTRAINT_DETAIL;
}

test.group('Logger: redaction', (group) => {
	group.each.setup(() => clearCapturedLogs());

	test('should drop the database constraint detail when an error is logged', ({
		assert,
	}) => {
		logger.error(
			{ err: new ConstraintViolationError('duplicate key') },
			'Insert failed'
		);

		assert.notInclude(
			JSON.stringify(readAlwaysOnLogs()),
			'someone@example.com'
		);
	});

	test('should keep the database error code when an error is logged', ({
		assert,
	}) => {
		logger.error(
			{ err: new ConstraintViolationError('duplicate key') },
			'Insert failed'
		);

		const errorLine = readAlwaysOnLogs().find(
			(line) => line.msg === 'Insert failed'
		);
		const serializedError = errorLine?.err as { code?: string };
		assert.equal(serializedError.code, '23505');
	});
});
