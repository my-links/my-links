import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import AuditEvent from '#models/audit_event';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { createUser } from '#tests/factories/user_factory';
import { captureConsoleOutput } from '#tests/helpers/console';
import PruneActivityEvents from '#commands/prune_activity_events';

test.group('activity:prune', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should delete activity rows past retention and spare an equally old auth row', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-activity' });
		const oldEnough = DateTime.now().minus({ days: 100 });

		const oldActivity = await AuditEvent.create({
			type: ACTIVITY_EVENT_TYPE.LINK_DELETED,
			userId: user.id,
			subjectType: AUDIT_SUBJECT_TYPE.LINK,
			subjectId: 1,
		});
		oldActivity.createdAt = oldEnough;
		await oldActivity.save();

		const oldAuth = await AuditEvent.create({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
		});
		oldAuth.createdAt = oldEnough;
		await oldAuth.save();

		const recentActivity = await AuditEvent.create({
			type: ACTIVITY_EVENT_TYPE.LINK_CREATED,
			userId: user.id,
			subjectType: AUDIT_SUBJECT_TYPE.LINK,
			subjectId: 2,
		});

		const command = await ace.create(PruneActivityEvents, []);
		await command.exec();

		command.assertSucceeded();
		await assert.rejects(() => AuditEvent.findOrFail(oldActivity.id));
		const survivingAuth = await AuditEvent.findOrFail(oldAuth.id);
		assert.equal(survivingAuth.type, AUTH_EVENT_TYPE.LOGIN_SUCCEEDED);
		const survivingActivity = await AuditEvent.findOrFail(recentActivity.id);
		assert.equal(survivingActivity.id, recentActivity.id);
	});
});
