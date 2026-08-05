import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import type { Locator, Page, Response } from 'playwright';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { Visibility } from '#enums/collections/visibility';
import { fillFormOnceHydrated } from '#tests/helpers/browser_forms';
import { nextClientAddress } from '#tests/helpers/client_addresses';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';
import {
	createUser,
	verifyUserEmail,
	setUserPassword,
} from '#tests/factories/user_factory';

const LOGIN_PATH = '/login';
const FAVORITES_PATH = '/collections/favorites';
const PASSWORD = 'correct-horse-battery-staple';

// dnd-kit's `PointerSensor` only starts a drag once the pointer has moved
// this many pixels from `mousedown` — mirrors `POINTER_SENSOR_OPTIONS` in
// `dashboard_dnd_provider.tsx`. Playwright's own `dragTo()` doesn't drive the
// sensor reliably, so every drag here is a manual mouse choreography instead.
const DRAG_STEPS = 15;
const DRAG_STEP_DELAY_MS = 20;

async function loginAsUser(
	page: Page,
	email: string,
	password: string
): Promise<void> {
	// The login throttle's memory store outlives a rolled back transaction, and
	// several specs in this suite log in for real — a shared address would let
	// one test's attempt spend another's budget.
	await page.setExtraHTTPHeaders({ 'x-forwarded-for': nextClientAddress() });
	await page.goto(LOGIN_PATH);
	await fillFormOnceHydrated(page, { email, password });
	await page.locator('button[type="submit"]').click();
	await page.assertPath(FAVORITES_PATH);
}

async function dragOnto(
	page: Page,
	source: Locator,
	target: Locator,
	{ shift = false }: { shift?: boolean } = {}
): Promise<void> {
	const sourceBox = await source.boundingBox();
	const targetBox = await target.boundingBox();
	if (!sourceBox || !targetBox) {
		throw new Error('Drag source or target has no bounding box');
	}

	const startX = sourceBox.x + sourceBox.width / 2;
	const startY = sourceBox.y + sourceBox.height / 2;
	const endX = targetBox.x + targetBox.width / 2;
	const endY = targetBox.y + targetBox.height / 2;

	await page.mouse.move(startX, startY);
	await page.mouse.down();
	if (shift) {
		await page.keyboard.down('Shift');
	}

	for (let step = 1; step <= DRAG_STEPS; step += 1) {
		const progress = step / DRAG_STEPS;
		await page.mouse.move(
			startX + (endX - startX) * progress,
			startY + (endY - startY) * progress
		);
		await page.waitForTimeout(DRAG_STEP_DELAY_MS);
	}

	await page.mouse.up();
	if (shift) {
		await page.keyboard.up('Shift');
	}
}

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
			visibility: Visibility.PRIVATE,
		});
		const second = await createCollection({
			author: user,
			name: 'Bravo Collection',
			visibility: Visibility.PRIVATE,
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

		const ordered = await Collection.query()
			.where('author_id', user.id)
			.andWhere('visibility', Visibility.PRIVATE)
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
			visibility: Visibility.PRIVATE,
		});
		const target = await createCollection({
			author: user,
			name: 'Target Collection',
			visibility: Visibility.PRIVATE,
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
			visibility: Visibility.PRIVATE,
		});
		const target = await createCollection({
			author: user,
			name: 'Target Collection',
			visibility: Visibility.PRIVATE,
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
			visibility: Visibility.PUBLIC,
		});
		const followed = await createCollection({
			author: owner,
			name: 'Followed Public',
			visibility: Visibility.PUBLIC,
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

		await sectionContainer(page, PUBLIC_HEADING)
			.getByRole('button', { name: 'Move section up' })
			.click();

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
