import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import AuditEvent from '#models/audit_event';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { createUser } from '#tests/factories/user_factory';
import { AuthEventService } from '#services/auth/auth_event_service';
import { recordAuthEvent } from '#tests/factories/auth_event_factory';
import {
	AUTH_EVENT_ORIGIN_RETENTION_DAYS,
	AUTH_EVENT_TYPE,
} from '#constants/auth';

async function backdate(event: AuditEvent, days: number): Promise<void> {
	event.createdAt = DateTime.now().minus({ days });
	await event.save();
}

test.group('AuthEventService.anonymizeExpiredOrigins', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should blank address and user agent of an auth row past retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'anonymize-old' });
		const event = await recordAuthEvent({
			user,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});
		await backdate(event, AUTH_EVENT_ORIGIN_RETENTION_DAYS + 1);

		await new AuthEventService().anonymizeExpiredOrigins();

		const row = await AuditEvent.findOrFail(event.id);
		assert.isNull(row.ip);
		assert.isNull(row.userAgent);
	});

	test('should keep the row itself after blanking its origin', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'anonymize-keep-row' });
		const event = await recordAuthEvent({
			user,
			type: AUTH_EVENT_TYPE.LOGIN_FAILED,
		});
		await backdate(event, AUTH_EVENT_ORIGIN_RETENTION_DAYS + 1);

		await new AuthEventService().anonymizeExpiredOrigins();

		const row = await AuditEvent.findOrFail(event.id);
		assert.equal(row.type, AUTH_EVENT_TYPE.LOGIN_FAILED);
		assert.equal(row.userId, user.id);
	});

	test('should keep the origin of an auth row inside retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'anonymize-recent' });
		const event = await recordAuthEvent({
			user,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});
		await backdate(event, AUTH_EVENT_ORIGIN_RETENTION_DAYS - 1);

		await new AuthEventService().anonymizeExpiredOrigins();

		const row = await AuditEvent.findOrFail(event.id);
		assert.isNotNull(row.ip);
		assert.isNotNull(row.userAgent);
	});

	test('should not touch an activity row past the auth retention', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'anonymize-activity' });
		const activity = await AuditEvent.create({
			type: ACTIVITY_EVENT_TYPE.LINK_CREATED,
			userId: user.id,
			subjectType: AUDIT_SUBJECT_TYPE.LINK,
			subjectId: 1,
			ip: '203.0.113.7',
			userAgent: 'Test Agent',
		});
		await backdate(activity, AUTH_EVENT_ORIGIN_RETENTION_DAYS + 1);

		await new AuthEventService().anonymizeExpiredOrigins();

		const row = await AuditEvent.findOrFail(activity.id);
		assert.equal(row.ip, '203.0.113.7');
	});

	test('should not bump updated_at when blanking an origin', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'anonymize-updated-at' });
		const event = await recordAuthEvent({
			user,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});
		await backdate(event, AUTH_EVENT_ORIGIN_RETENTION_DAYS + 1);
		const updatedAtBefore = (await AuditEvent.findOrFail(event.id)).updatedAt;

		await new AuthEventService().anonymizeExpiredOrigins();

		const row = await AuditEvent.findOrFail(event.id);
		assert.equal(row.updatedAt?.toMillis(), updatedAtBefore?.toMillis());
	});

	test('should report how many rows it blanked', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'anonymize-count' });
		const event = await recordAuthEvent({
			user,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});
		await backdate(event, AUTH_EVENT_ORIGIN_RETENTION_DAYS + 1);

		const anonymizedCount =
			await new AuthEventService().anonymizeExpiredOrigins();

		assert.isAtLeast(anonymizedCount, 1);
	});
});
