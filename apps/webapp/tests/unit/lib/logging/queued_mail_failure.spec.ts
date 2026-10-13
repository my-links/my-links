import { test } from '@japa/runner';
import emitter from '@adonisjs/core/services/emitter';

import {
	clearCapturedLogs,
	readAlwaysOnLogs,
} from '#tests/helpers/captured_logs';

const RECIPIENT_ADDRESS = 'recipient-under-test@example.com';

class RejectedRecipientError extends Error {
	readonly code = 'EENVELOPE';
	readonly responseCode = 550;
	readonly command = 'RCPT TO';
	readonly response = `550 <${RECIPIENT_ADDRESS}>: Recipient address rejected`;

	constructor() {
		super(`Can't send mail to ${RECIPIENT_ADDRESS}`);
	}
}

async function emitDeliveryFailure() {
	await emitter.emit('queued:mail:error', {
		error: new RejectedRecipientError(),
		mailerName: 'smtp',
	});
}

test.group('Queued mail failure: logging', (group) => {
	group.each.setup(() => clearCapturedLogs());

	test('should keep the recipient address out of info and error logs when delivery fails', async ({
		assert,
	}) => {
		await emitDeliveryFailure();

		assert.notInclude(JSON.stringify(readAlwaysOnLogs()), RECIPIENT_ADDRESS);
	});

	test('should log the SMTP response code when delivery fails', async ({
		assert,
	}) => {
		await emitDeliveryFailure();

		const failureLine = readAlwaysOnLogs().find(
			(line) => line.msg === 'Queued email delivery failed'
		);
		assert.equal(failureLine?.responseCode, 550);
	});
});
