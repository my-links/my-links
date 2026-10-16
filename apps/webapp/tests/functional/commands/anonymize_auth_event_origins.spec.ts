import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import AuditEvent from '#models/audit_event';
import { createUser } from '#tests/factories/user_factory';
import { captureConsoleOutput } from '#tests/helpers/console';
import { recordAuthEvent } from '#tests/factories/auth_event_factory';
import AnonymizeAuthEventOrigins from '#commands/anonymize_auth_event_origins';
import {
	AUTH_EVENT_TYPE,
	AUTH_EVENT_ORIGIN_RETENTION_DAYS,
} from '#constants/auth';

test.group('auth-events:anonymize-origins', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should blank the origin of an auth row past retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'anonymize-command' });
		const event = await recordAuthEvent({
			user,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});
		event.createdAt = DateTime.now().minus({
			days: AUTH_EVENT_ORIGIN_RETENTION_DAYS + 1,
		});
		await event.save();

		const command = await ace.create(AnonymizeAuthEventOrigins, []);
		await command.exec();

		command.assertSucceeded();
		const row = await AuditEvent.findOrFail(event.id);
		assert.isNull(row.ip);
	});
});
