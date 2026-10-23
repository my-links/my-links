import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import { AUDIT_JOURNAL_PAGE_SIZE } from '#constants/audit';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import AuditEvent from '#models/audit_event';
import { recordAuthEvent } from '#tests/factories/auth_event_factory';
import { createAdmin, createUser } from '#tests/factories/user_factory';
import { inertiaPageProps } from '#tests/helpers/inertia_page';

const AUTH_JOURNAL_ROUTE = '/admin/auth-events';
const HOME_ROUTE = '/';

type JournalLine = {
	readonly type: string;
	readonly fullname: string | null;
	readonly actorFullname: string | null;
	readonly maskedIp: string | null;
};

/**
 * The suite runs against a database a developer may have used, so a spec about
 * ordering or paging has to start from a journal it knows. Rolled back with the
 * rest of the transaction.
 */
async function emptyJournal(): Promise<void> {
	await AuditEvent.query().delete();
}

test.group('Admin authentication journal', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(() => emptyJournal());

	test('should render the journal page to an administrator', async ({
		client,
	}) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		response.assertStatus(200);
		response.assertInertiaComponent('admin/auth_journal');
	});

	test('should name the account an event happened to', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });
		const account = await createUser({ emailPrefix: 'journal-subject' });
		await recordAuthEvent({
			user: account,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		const events: JournalLine[] = inertiaPageProps(response).events;
		assert.equal(events[0]?.fullname, account.fullname);
	});

	test('should send the network of the address instead of the address itself', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });
		const account = await createUser({ emailPrefix: 'journal-masked' });
		await recordAuthEvent({
			user: account,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		const events: JournalLine[] = inertiaPageProps(response).events;
		assert.equal(events[0]?.maskedIp, '203.0.113.0/24');
	});

	test('should not send the full address in any field', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });
		const account = await createUser({ emailPrefix: 'journal-no-full-ip' });
		await recordAuthEvent({
			user: account,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		assert.notInclude(
			JSON.stringify(inertiaPageProps(response).events),
			'203.0.113.7'
		);
	});

	test('should name the administrator behind an action taken on somebody else', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });
		const account = await createUser({ emailPrefix: 'journal-target' });
		await recordAuthEvent({
			user: account,
			type: AUTH_EVENT_TYPE.ACCESS_REVOKED,
			actor: administrator,
		});

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		const events: JournalLine[] = inertiaPageProps(response).events;
		assert.equal(events[0]?.actorFullname, administrator.fullname);
	});

	test('should leave the actor empty for something an account did itself', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });
		const account = await createUser({ emailPrefix: 'journal-self' });
		await recordAuthEvent({
			user: account,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		const events: JournalLine[] = inertiaPageProps(response).events;
		assert.isNull(events[0]?.actorFullname);
	});

	test('should hand over one page at a time', async ({ assert, client }) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });
		const account = await createUser({ emailPrefix: 'journal-paging' });
		for (let index = 0; index <= AUDIT_JOURNAL_PAGE_SIZE; index += 1) {
			await recordAuthEvent({
				user: account,
				type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			});
		}

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		const events: JournalLine[] = inertiaPageProps(response).events;
		assert.lengthOf(events, AUDIT_JOURNAL_PAGE_SIZE);
	});

	test('should report how many pages the journal holds', async ({ client }) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });
		const account = await createUser({ emailPrefix: 'journal-pages' });
		for (let index = 0; index <= AUDIT_JOURNAL_PAGE_SIZE; index += 1) {
			await recordAuthEvent({
				user: account,
				type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
			});
		}

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.withInertia()
			.loginAs(administrator);

		response.assertInertiaPropsContains({ currentPage: 1, lastPage: 2 });
	});

	test('should serve the page the query string asks for', async ({
		client,
	}) => {
		const administrator = await createAdmin({ emailPrefix: 'journal-admin' });

		const response = await client
			.get(`${AUTH_JOURNAL_ROUTE}?page=2`)
			.withInertia()
			.loginAs(administrator);

		response.assertInertiaPropsContains({ currentPage: 2 });
	});

	test('should send a signed-in visitor without the admin flag back to their collections', async ({
		client,
	}) => {
		const visitor = await createUser({ emailPrefix: 'journal-not-admin' });

		const response = await client
			.get(AUTH_JOURNAL_ROUTE)
			.loginAs(visitor)
			.redirects(0);

		response.assertHeader('location', HOME_ROUTE);
	});
});
