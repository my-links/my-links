import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';
import type { Session } from '@adonisjs/session';
import { test } from '@japa/runner';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import { NO_REQUEST_ORIGIN } from '#lib/request_origin';
import AuditEvent from '#models/audit_event';
import { PENDING_REACTIVATION_SESSION_KEY } from '#services/auth/account_reactivation_service';
import {
	PendingDeletionGuard,
	PENDING_DELETION_OUTCOME,
} from '#services/auth/pending_deletion_guard';
import {
	createUser,
	requestAccountDeletion,
} from '#tests/factories/user_factory';

const ADMINISTRATOR_ID_PLACEHOLDER_PREFIX = 'guard-admin';

function createSessionStub() {
	const values = new Map<string, unknown>();
	const session = {
		put: (key: string, value: unknown) => values.set(key, value),
		forget: (key: string) => values.delete(key),
	} as unknown as Session;

	return { session, values };
}

async function countEvents(type: string, userId: number): Promise<number> {
	const events = await AuditEvent.query()
		.where('type', type)
		.andWhere('userId', userId);

	return events.length;
}

test.group(
	'Pending deletion guard: shared by every sign-in method',
	(group) => {
		group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

		test('should let an account without a pending deletion proceed', async ({
			assert,
		}) => {
			const user = await createUser({ emailPrefix: 'guard-active' });
			const guard = await app.container.make(PendingDeletionGuard);
			const { session, values } = createSessionStub();

			const outcome = await guard.evaluate(user, session, NO_REQUEST_ORIGIN);

			assert.equal(outcome, PENDING_DELETION_OUTCOME.PROCEED);
			assert.isFalse(values.has(PENDING_REACTIVATION_SESSION_KEY));
		});

		test('should require reactivation and arm the session for a self-requested deletion', async ({
			assert,
		}) => {
			const user = await createUser({ emailPrefix: 'guard-self' });
			await requestAccountDeletion(user);
			const guard = await app.container.make(PendingDeletionGuard);
			const { session, values } = createSessionStub();

			const outcome = await guard.evaluate(user, session, NO_REQUEST_ORIGIN);

			assert.equal(outcome, PENDING_DELETION_OUTCOME.REACTIVATION_REQUIRED);
			assert.isTrue(values.has(PENDING_REACTIVATION_SESSION_KEY));
			assert.equal(
				await countEvents(
					AUTH_EVENT_TYPE.LOGIN_BLOCKED_PENDING_DELETION,
					user.id
				),
				1
			);
		});

		test('should block an administrator-requested deletion without arming the session', async ({
			assert,
		}) => {
			const administrator = await createUser({
				emailPrefix: ADMINISTRATOR_ID_PLACEHOLDER_PREFIX,
			});
			const user = await createUser({ emailPrefix: 'guard-admin-target' });
			await requestAccountDeletion(user, undefined, administrator.id);
			const guard = await app.container.make(PendingDeletionGuard);
			const { session, values } = createSessionStub();

			const outcome = await guard.evaluate(user, session, NO_REQUEST_ORIGIN);

			assert.equal(outcome, PENDING_DELETION_OUTCOME.BLOCKED_BY_ADMIN);
			assert.isFalse(values.has(PENDING_REACTIVATION_SESSION_KEY));
			assert.equal(
				await countEvents(
					AUTH_EVENT_TYPE.LOGIN_BLOCKED_ADMIN_DELETION,
					user.id
				),
				1
			);
		});
	}
);
