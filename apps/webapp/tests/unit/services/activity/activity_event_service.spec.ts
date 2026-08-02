import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import AuditEvent from '#models/audit_event';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { createUser } from '#tests/factories/user_factory';
import { ActivityEventService } from '#services/activity/activity_event_service';

test.group('Activity event service', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should write a row with no address when called outside a request', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'activity-record' });
		const service = new ActivityEventService();

		await service.record({
			type: ACTIVITY_EVENT_TYPE.LINK_CREATED,
			userId: user.id,
			subjectType: AUDIT_SUBJECT_TYPE.LINK,
			subjectId: 4102,
			metadata: { favorite: true },
		});

		const row = await AuditEvent.query().where('userId', user.id).firstOrFail();
		assert.equal(row.type, ACTIVITY_EVENT_TYPE.LINK_CREATED);
		assert.equal(row.subjectType, AUDIT_SUBJECT_TYPE.LINK);
		assert.equal(row.subjectId, 4102);
		assert.deepEqual(row.metadata, { favorite: true });
		assert.isNull(row.ip);
		assert.isNull(row.userAgent);
	});

	test('should hand over only activity rows, never authentication rows', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'activity-list' });
		const service = new ActivityEventService();

		await AuditEvent.create({
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			userId: user.id,
		});
		await service.record({
			type: ACTIVITY_EVENT_TYPE.COLLECTION_CREATED,
			userId: user.id,
			subjectType: AUDIT_SUBJECT_TYPE.COLLECTION,
			subjectId: 77,
		});

		const page = await service.listRecent(1);

		assert.lengthOf(page.all(), 1);
		assert.equal(page.all()[0]?.subjectType, AUDIT_SUBJECT_TYPE.COLLECTION);
	});

	test('should prune only activity rows older than the cutoff', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'activity-prune' });
		const service = new ActivityEventService();
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

		const deletedCount = await service.pruneBefore(
			DateTime.now().minus({ days: 90 })
		);

		assert.equal(deletedCount, 1);
		await assert.rejects(() => AuditEvent.findOrFail(oldActivity.id));
		const survivingAuthEvent = await AuditEvent.findOrFail(oldAuth.id);
		assert.equal(survivingAuthEvent.type, AUTH_EVENT_TYPE.LOGIN_SUCCEEDED);
	});
});
