import testUtils from '@adonisjs/core/services/test_utils';
import db from '@adonisjs/lucid/services/db';
import { test } from '@japa/runner';
import type { Locator, Page, Response } from 'playwright';

import { VISIBILITY } from '#enums/collections/visibility';
import Collection from '#models/collection';
import {
	createInbox,
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createUser,
	verifyUserEmail,
	setUserPassword,
} from '#tests/factories/user_factory';
import { dragOnto } from '#tests/helpers/browser_drag';
import { loginAsUser } from '#tests/helpers/browser_session';

const LOGIN_PATH = '/login';
const PASSWORD = 'correct-horse-battery-staple';

function sectionContainer(page: Page, heading: string): Locator {
	return page.locator('div.mb-2', { hasText: heading });
}

async function headingY(page: Page, heading: string): Promise<number> {
	const box = await page.getByText(heading, { exact: true }).boundingBox();
	if (!box) {
		throw new Error(`Heading "${heading}" not found`);
	}
	return box.y;
}

function isRequestFor(method: string, urlFragment: string) {
	return (response: Response) =>
		response.request().method() === method &&
		response.url().includes(urlFragment);
}

async function dragOntoAndWaitFor(
	page: Page,
	source: Locator,
	target: Locator,
	method: string,
	urlFragment: string,
	options?: { shift?: boolean }
): Promise<void> {
	const responsePromise = page.waitForResponse(
		isRequestFor(method, urlFragment)
	);
	await dragOnto(page, source, target, options);
	await responsePromise;
}

test.group('Dashboard reordering (browser)', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should persist a manual reorder of sidebar collections', async ({
		visit,
		assert,
	}) => {
		const user = await createUser({
			emailPrefix: 'browser-reorder-collections',
		});
		await verifyUserEmail(user);
		await setUserPassword(user, PASSWORD);

		const first = await createCollection({
			author: user,
			name: 'Alpha Collection',
			visibility: VISIBILITY.PRIVATE,
		});
		const second = await createCollection({
			author: user,
			name: 'Bravo Collection',
			visibility: VISIBILITY.PRIVATE,
		});

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);

		const firstCard = page.getByTitle('Alpha Collection', { exact: true });
		const secondCard = page.getByTitle('Bravo Collection', { exact: true });
		await firstCard.waitFor();
		await secondCard.waitFor();

		await dragOntoAndWaitFor(
			page,
			secondCard,
			firstCard,
			'PUT',
			'/collections/owned/reorder'
		);
		await page.waitForLoadState('networkidle');

		// Same scope the sidebar sorts: the pinned Inbox the dashboard opened on
		// first render is not part of the reordered section.
		const ordered = await Collection.query()
			.where('author_id', user.id)
			.andWhere('visibility', VISIBILITY.PRIVATE)
			.andWhere('is_default', false)
			.orderBy('position', 'asc');

		assert.deepEqual(
			ordered.map((collection) => collection.id),
			[second.id, first.id]
		);
	});

	test('should move a dropped link into the target collection without duplicating it', async ({
		visit,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'browser-move-link' });
		await verifyUserEmail(user);
		await setUserPassword(user, PASSWORD);

		const source = await createCollection({
			author: user,
			name: 'Source Collection',
			visibility: VISIBILITY.PRIVATE,
		});
		const target = await createCollection({
			author: user,
			name: 'Target Collection',
			visibility: VISIBILITY.PRIVATE,
		});
		const link = await createLink({
			author: user,
			name: 'Movable Link',
			url: 'https://example.com/browser-move-link',
		});
		await attachLinkToCollection(link, source);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await page.goto(`/collections/${source.id}`);

		const linkCard = page.getByTitle(link.url, { exact: true });
		const targetCard = page.getByTitle('Target Collection', { exact: true });
		await linkCard.waitFor();
		await targetCard.waitFor();

		await dragOntoAndWaitFor(
			page,
			linkCard,
			targetCard,
			'PUT',
			`/links/${link.id}/collection`
		);
		await page.waitForLoadState('networkidle');

		const memberships = await db
			.from('collection_link')
			.where('link_id', link.id)
			.select('collection_id');
		const linkRows = await db.from('links').where('id', link.id);

		assert.deepEqual(
			memberships.map((row) => row.collection_id),
			[target.id]
		);
		assert.lengthOf(linkRows, 1);
	});

	test('should pin the Inbox outside the private collections section', async ({
		visit,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'browser-inbox-pinned' });
		await verifyUserEmail(user);
		await setUserPassword(user, PASSWORD);
		await createInbox(user);
		await createCollection({
			author: user,
			name: 'Alpha Collection',
			visibility: VISIBILITY.PRIVATE,
		});

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);

		const inboxCard = page.getByTitle('Inbox', { exact: true });
		await inboxCard.waitFor();
		const privateSection = sectionContainer(page, 'My Private Collections');
		await privateSection
			.getByTitle('Alpha Collection', { exact: true })
			.waitFor();

		assert.equal(
			await privateSection.getByTitle('Inbox', { exact: true }).count(),
			0
		);
	});

	test('should move a link dropped onto the pinned Inbox', async ({
		visit,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'browser-inbox-drop' });
		await verifyUserEmail(user);
		await setUserPassword(user, PASSWORD);

		const inbox = await createInbox(user);
		const source = await createCollection({
			author: user,
			name: 'Source Collection',
			visibility: VISIBILITY.PRIVATE,
		});
		const link = await createLink({
			author: user,
			name: 'Filed Link',
			url: 'https://example.com/browser-inbox-drop',
		});
		await attachLinkToCollection(link, source);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await page.goto(`/collections/${source.id}`);

		const linkCard = page.getByTitle(link.url, { exact: true });
		const inboxCard = page.getByTitle('Inbox', { exact: true });
		await linkCard.waitFor();
		await inboxCard.waitFor();

		await dragOntoAndWaitFor(
			page,
			linkCard,
			inboxCard,
			'PUT',
			`/links/${link.id}/collection`
		);
		await page.waitForLoadState('networkidle');

		const memberships = await db
			.from('collection_link')
			.where('link_id', link.id)
			.select('collection_id');

		assert.deepEqual(
			memberships.map((row) => row.collection_id),
			[inbox.id]
		);
	});

	test('should add a dropped link to the target collection when Shift is held, keeping the source', async ({
		visit,
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'browser-add-link' });
		await verifyUserEmail(user);
		await setUserPassword(user, PASSWORD);

		const source = await createCollection({
			author: user,
			name: 'Source Collection',
			visibility: VISIBILITY.PRIVATE,
		});
		const target = await createCollection({
			author: user,
			name: 'Target Collection',
			visibility: VISIBILITY.PRIVATE,
		});
		const link = await createLink({
			author: user,
			name: 'Shared Link',
			url: 'https://example.com/browser-add-link',
		});
		await attachLinkToCollection(link, source);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await page.goto(`/collections/${source.id}`);

		const linkCard = page.getByTitle(link.url, { exact: true });
		const targetCard = page.getByTitle('Target Collection', { exact: true });
		await linkCard.waitFor();
		await targetCard.waitFor();

		await dragOntoAndWaitFor(
			page,
			linkCard,
			targetCard,
			'POST',
			`/links/${link.id}/collections`,
			{ shift: true }
		);
		await page.waitForLoadState('networkidle');

		const memberships = await db
			.from('collection_link')
			.where('link_id', link.id)
			.select('collection_id');
		const linkRows = await db.from('links').where('id', link.id);

		assert.sameDeepMembers(
			memberships.map((row) => row.collection_id),
			[source.id, target.id]
		);
		assert.lengthOf(linkRows, 1);
	});

	test('should reorder sidebar sections with the move buttons and persist across reload', async ({
		visit,
		assert,
	}) => {
		const owner = await createUser({ emailPrefix: 'browser-section-owner' });
		const user = await createUser({ emailPrefix: 'browser-reorder-sections' });
		await verifyUserEmail(user);
		await setUserPassword(user, PASSWORD);

		await createCollection({
			author: user,
			name: 'Owned Public',
			visibility: VISIBILITY.PUBLIC,
		});
		const followed = await createCollection({
			author: owner,
			name: 'Followed Public',
			visibility: VISIBILITY.PUBLIC,
		});
		await followCollection(followed, user);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);

		const FOLLOWED_HEADING = 'Followed Collections';
		const PUBLIC_HEADING = 'My Public Collections';
		const PRIVATE_HEADING = 'My Private Collections';

		await page.getByText(PRIVATE_HEADING).waitFor();

		const initialFollowedY = await headingY(page, FOLLOWED_HEADING);
		const initialPublicY = await headingY(page, PUBLIC_HEADING);
		const initialPrivateY = await headingY(page, PRIVATE_HEADING);
		assert.isBelow(initialFollowedY, initialPublicY);
		assert.isBelow(initialPublicY, initialPrivateY);

		// The options button sits in a `pointer-events-none` overlay that only
		// flips to `auto` on `.group:hover`, so hovering it directly fails the
		// same actionability check its click would. Hovering the heading text
		// instead (a plain descendant of the same `.group`, away from the
		// overlay) establishes the hover state first, then the click lands.
		await page.getByText(PUBLIC_HEADING, { exact: true }).hover();
		await sectionContainer(page, PUBLIC_HEADING)
			.getByRole('button', { name: 'Section options' })
			.click();
		await page.getByRole('menuitem', { name: 'Move up' }).click();

		const reorderedPublicY = await headingY(page, PUBLIC_HEADING);
		const reorderedFollowedY = await headingY(page, FOLLOWED_HEADING);
		const reorderedPrivateY = await headingY(page, PRIVATE_HEADING);
		assert.isBelow(reorderedPublicY, reorderedFollowedY);
		assert.isBelow(reorderedFollowedY, reorderedPrivateY);

		await page.reload();
		await page.getByText(PRIVATE_HEADING).waitFor();

		const persistedPublicY = await headingY(page, PUBLIC_HEADING);
		const persistedFollowedY = await headingY(page, FOLLOWED_HEADING);
		const persistedPrivateY = await headingY(page, PRIVATE_HEADING);
		assert.isBelow(persistedPublicY, persistedFollowedY);
		assert.isBelow(persistedFollowedY, persistedPrivateY);
	});
});
