import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import AuditEvent from '#models/audit_event';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { createUser } from '#tests/factories/user_factory';
import { inertiaPageProps } from '#tests/helpers/inertia_page';
import { ACTIVITY_JOURNAL_PAGE_SIZE } from '#services/activity/activity_event_service';

const ACTIVITY_JOURNAL_ROUTE = '/admin/activity-events';
const FAVORITES_ROUTE = '/collections/favorites';

type JournalLine = {
	readonly type: string;
	readonly subjectType: string | null;
	readonly subjectId: number | null;
	readonly email: string | null;
};

async function createAdmin(): Promise<User> {
	const user = await createUser({ emailPrefix: 'activity-journal-admin' });
	user.isAdmin = true;
	await user.save();

	return user;
}

/**
 * The suite runs against a database a developer may have used, so a spec about
 * ordering or paging has to start from a journal it knows. Rolled back with the
 * rest of the transaction.
 */
async function emptyJournal(): Promise<void> {
	await AuditEvent.query().delete();
}

async function recordActivityEvent(user: User): Promise<void> {
	await AuditEvent.create({
		type: ACTIVITY_EVENT_TYPE.LINK_CREATED,
		userId: user.id,
		subjectType: AUDIT_SUBJECT_TYPE.LINK,
		subjectId: 4102,
	});
}

test.group('Admin activity journal', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => emptyJournal());

	test('should render the journal page to an administrator', async ({
		client,
	}) => {
		const administrator = await createAdmin();

		const response = await client
			.get(ACTIVITY_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		response.assertStatus(200);
		response.assertInertiaComponent('admin/activity_journal');
	});

	test('should name the account and the subject an activity event happened to', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({
			emailPrefix: 'activity-journal-subject',
		});
		await recordActivityEvent(account);

		const response = await client
			.get(ACTIVITY_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		const events: JournalLine[] = inertiaPageProps(response).events;
		assert.equal(events[0]?.email, account.email);
		assert.equal(events[0]?.subjectType, AUDIT_SUBJECT_TYPE.LINK);
		assert.equal(events[0]?.subjectId, 4102);
	});

	test('should keep authentication rows out of the activity journal', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'activity-journal-auth' });
		await AuditEvent.create({ type: 'login_succeeded', userId: account.id });

		const response = await client
			.get(ACTIVITY_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		const events: JournalLine[] = inertiaPageProps(response).events;
		assert.lengthOf(events, 0);
	});

	test('should hand over one page at a time', async ({ assert, client }) => {
		const administrator = await createAdmin();
		const account = await createUser({
			emailPrefix: 'activity-journal-paging',
		});
		for (let index = 0; index <= ACTIVITY_JOURNAL_PAGE_SIZE; index += 1) {
			await recordActivityEvent(account);
		}

		const response = await client
			.get(ACTIVITY_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		const events: JournalLine[] = inertiaPageProps(response).events;
		assert.lengthOf(events, ACTIVITY_JOURNAL_PAGE_SIZE);
	});

	test('should send a signed-in visitor without the admin flag back to their collections', async ({
		client,
	}) => {
		const visitor = await createUser({
			emailPrefix: 'activity-journal-not-admin',
		});

		const response = await client
			.get(ACTIVITY_JOURNAL_ROUTE)
			.loginAs(visitor)
			.redirects(0);

		response.assertHeader('location', FAVORITES_ROUTE);
	});
});
