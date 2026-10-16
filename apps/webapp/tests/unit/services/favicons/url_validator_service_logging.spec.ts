import { test } from '@japa/runner';
import logger from '@adonisjs/core/services/logger';

import { UrlValidatorService } from '#services/favicons/url_validator_service';
import {
	clearCapturedLogs,
	readCapturedLogs,
} from '#tests/helpers/captured_logs';

const PRIVATE_PATH = '/private/page';
const PRIVATE_QUERY = 'token=abc123';
const PRIVATE_URL = `http://10.0.0.5${PRIVATE_PATH}?${PRIVATE_QUERY}`;

test.group('UrlValidatorService: logging', (group) => {
	let originalLevel: string;

	group.each.setup(() => {
		originalLevel = logger.level;
		logger.level = 'debug';
		clearCapturedLogs();
	});

	group.each.teardown(() => {
		logger.level = originalLevel;
	});

	test('should keep the path out of the debug log when a url is blocked', async ({
		assert,
	}) => {
		const validator = new UrlValidatorService(async () => [
			{ address: '10.0.0.5', family: 4 },
		]);

		await validator.checkUrl(PRIVATE_URL);

		assert.notInclude(JSON.stringify(readCapturedLogs()), PRIVATE_PATH);
	});

	test('should keep the query string out of the debug log when a url is blocked', async ({
		assert,
	}) => {
		const validator = new UrlValidatorService(async () => [
			{ address: '10.0.0.5', family: 4 },
		]);

		await validator.checkUrl(PRIVATE_URL);

		assert.notInclude(JSON.stringify(readCapturedLogs()), PRIVATE_QUERY);
	});

	test('should still log the blocked outcome', async ({ assert }) => {
		const validator = new UrlValidatorService(async () => [
			{ address: '10.0.0.5', family: 4 },
		]);

		await validator.checkUrl(PRIVATE_URL);

		assert.isTrue(
			readCapturedLogs().some(
				(line) => line.msg === 'Blocked internal/private target'
			)
		);
	});
});
