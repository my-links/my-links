import { test } from '@japa/runner';
import db from '@adonisjs/lucid/services/db';
import type { Page, Response } from 'playwright';
import testUtils from '@adonisjs/core/services/test_utils';

import Collection from '#models/collection';
import { dragOnto } from '#tests/helpers/browser_drag';
import { loginAsUser } from '#tests/helpers/browser_session';
import { VISIBILITY, type Visibility } from '#enums/collections/visibility';
import {
	createLink,
	attachLinkToCollection,
} from '#tests/factories/link_factory';
import {
	createUser,
	verifyUserEmail,
	setUserPassword,
} from '#tests/factories/user_factory';
import {
	createInbox,
	createCollection,
	followCollection,
} from '#tests/factories/collection_factory';

const LOGIN_PATH = '/login';
const PASSWORD = 'correct-horse-battery-staple';
const COLLECTION_NAME = 'Visibility Collection';

async function createOwnerWithCollection(
	emailPrefix: string,
	visibility: Visibility
) {
	const user = await createUser({ emailPrefix });
	await verifyUserEmail(user);
	await setUserPassword(user, PASSWORD);
	await createInbox(user);
	const collection = await createCollection({
		author: user,
		name: COLLECTION_NAME,
		visibility,
	});
	return { user, collection };
}

async function openEditModal(page: Page): Promise<void> {
	const row = page.getByTitle(COLLECTION_NAME, { exact: true });
	await row.waitFor();
	await row.click({ button: 'right' });
	await page.getByRole('menuitem', { name: 'Edit collection' }).click();
	await page.getByRole('dialog').waitFor();
}

async function chooseVisibilityAndSubmit(
	page: Page,
	label: string
): Promise<void> {
	const dialog = page.getByRole('dialog');
	await dialog.getByText(label, { exact: true }).click();
	await dialog.getByRole('button', { name: 'Update' }).click();
}

async function readVisibility(collectionId: number): Promise<Visibility> {
	const collection = await Collection.findOrFail(collectionId);
	return collection.visibility;
}

const LOWER_HALF_OFFSET_PX = 10;
const MOVING_NAME = 'Moving Collection';
const ANCHOR_NAME = 'Anchor Collection';
const PUBLIC_SECTION_HEADING = 'My Public Collections';

async function createOwner(emailPrefix: string) {
	const user = await createUser({ emailPrefix });
	await verifyUserEmail(user);
	await setUserPassword(user, PASSWORD);
	await createInbox(user);
	return user;
}

async function openDashboard(page: Page, user: { email: string }) {
	await loginAsUser(page, user.email, PASSWORD);
}

function card(page: Page, name: string) {
	return page.getByTitle(name, { exact: true });
}

function sectionHeading(page: Page, heading: string) {
	return page.getByText(heading, { exact: true }).first();
}

function isMoveRequest(collectionId: number) {
	return (response: Response) =>
		response.request().method() === 'PUT' &&
		response.url().includes(`/collections/${collectionId}/section`);
}

async function sectionOrder(userId: number, visibility: Visibility) {
	const collections = await Collection.query()
		.where('author_id', userId)
		.andWhere('visibility', visibility)
		.andWhere('is_default', false)
		.orderBy('position', 'asc');
	return collections.map((collection) => collection.id);
}

async function followersCount(collectionId: number) {
	const rows = await db
		.from('collection_followers')
		.where('collection_id', collectionId)
		.count('* as total');
	return Number(rows[0].total);
}

test.group('Collection visibility (browser)', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should show the link count and share URL when switching a private collection to public', async ({
		visit,
		assert,
	}) => {
		const { user, collection } = await createOwnerWithCollection(
			'browser-expose-confirm',
			VISIBILITY.PRIVATE
		);
		const link = await createLink({
			author: user,
			name: 'Exposed Link',
			url: 'https://example.com/browser-expose-confirm',
		});
		await attachLinkToCollection(link, collection);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await openEditModal(page);
		await chooseVisibilityAndSubmit(page, 'Public');

		const dialog = page.getByRole('dialog');
		await dialog.getByText('1 link will become public').waitFor();

		assert.isTrue(
			await dialog.getByText(`/shared/${collection.id}`).isVisible()
		);
	});

	test('should keep the collection private when the exposure is not confirmed yet', async ({
		visit,
		assert,
	}) => {
		const { user, collection } = await createOwnerWithCollection(
			'browser-expose-pending',
			VISIBILITY.PRIVATE
		);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await openEditModal(page);
		await chooseVisibilityAndSubmit(page, 'Public');
		await page.getByRole('button', { name: 'Make public' }).waitFor();
		await page.waitForLoadState('networkidle');

		assert.equal(await readVisibility(collection.id), VISIBILITY.PRIVATE);
	});

	test('should save the collection as public when the exposure is confirmed', async ({
		visit,
		assert,
	}) => {
		const { user, collection } = await createOwnerWithCollection(
			'browser-expose-save',
			VISIBILITY.PRIVATE
		);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await openEditModal(page);
		await chooseVisibilityAndSubmit(page, 'Public');
		await page.getByRole('button', { name: 'Make public' }).click();
		await page.getByRole('dialog').waitFor({ state: 'detached' });

		assert.equal(await readVisibility(collection.id), VISIBILITY.PUBLIC);
	});

	test('should return to the form without saving when Back is clicked on the confirmation', async ({
		visit,
		assert,
	}) => {
		const { user, collection } = await createOwnerWithCollection(
			'browser-expose-back',
			VISIBILITY.PRIVATE
		);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await openEditModal(page);
		await chooseVisibilityAndSubmit(page, 'Public');
		await page.getByRole('button', { name: 'Back' }).click();
		await page
			.getByRole('dialog')
			.getByRole('button', { name: 'Update' })
			.waitFor();

		assert.equal(await readVisibility(collection.id), VISIBILITY.PRIVATE);
	});

	test('should save directly without confirmation when switching a public collection to private', async ({
		visit,
		assert,
	}) => {
		const { user, collection } = await createOwnerWithCollection(
			'browser-hide-direct',
			VISIBILITY.PUBLIC
		);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await openEditModal(page);
		await chooseVisibilityAndSubmit(page, 'Private');
		await page.getByRole('dialog').waitFor({ state: 'detached' });

		assert.equal(await readVisibility(collection.id), VISIBILITY.PRIVATE);
	});

	test('should save a followed public collection as private after the followers confirmation in the edit modal', async ({
		visit,
		assert,
	}) => {
		const { user, collection } = await createOwnerWithCollection(
			'browser-hide-followers',
			VISIBILITY.PUBLIC
		);
		const follower = await createUser({ emailPrefix: 'browser-hide-follower' });
		await followCollection(collection, follower);

		const page = await visit(LOGIN_PATH);
		await loginAsUser(page, user.email, PASSWORD);
		await openEditModal(page);
		await chooseVisibilityAndSubmit(page, 'Private');
		const dialog = page.getByRole('dialog');
		await dialog
			.getByText('1 follower will lose access to this collection')
			.waitFor();
		assert.equal(await readVisibility(collection.id), VISIBILITY.PUBLIC);

		await dialog.getByRole('button', { name: 'Make private' }).click();
		await dialog.waitFor({ state: 'detached' });

		assert.equal(await readVisibility(collection.id), VISIBILITY.PRIVATE);
		assert.equal(await followersCount(collection.id), 0);
	});
});

test.group('Collection section drag and drop (browser)', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should ask for the exposure confirmation and keep the collection private until confirmed', async ({
		visit,
		assert,
	}) => {
		const user = await createOwner('browser-dnd-expose-pending');
		const moving = await createCollection({ author: user, name: MOVING_NAME });
		await createCollection({
			author: user,
			name: ANCHOR_NAME,
			visibility: VISIBILITY.PUBLIC,
		});

		const page = await visit(LOGIN_PATH);
		await openDashboard(page, user);
		await card(page, MOVING_NAME).waitFor();
		await dragOnto(page, card(page, MOVING_NAME), card(page, ANCHOR_NAME));

		await page.getByRole('button', { name: 'Make public' }).waitFor();
		await page.waitForLoadState('networkidle');

		assert.equal(await readVisibility(moving.id), VISIBILITY.PRIVATE);
	});

	test('should save the collection as public at the dropped position when the drag is confirmed', async ({
		visit,
		assert,
	}) => {
		const user = await createOwner('browser-dnd-expose-confirm');
		const moving = await createCollection({ author: user, name: MOVING_NAME });
		const anchor = await createCollection({
			author: user,
			name: ANCHOR_NAME,
			visibility: VISIBILITY.PUBLIC,
		});

		const page = await visit(LOGIN_PATH);
		await openDashboard(page, user);
		await card(page, MOVING_NAME).waitFor();
		await dragOnto(page, card(page, MOVING_NAME), card(page, ANCHOR_NAME), {
			offsetY: -LOWER_HALF_OFFSET_PX,
		});

		const responsePromise = page.waitForResponse(isMoveRequest(moving.id));
		await page.getByRole('button', { name: 'Make public' }).click();
		await responsePromise;
		await page.waitForLoadState('networkidle');

		assert.deepEqual(await sectionOrder(user.id, VISIBILITY.PUBLIC), [
			moving.id,
			anchor.id,
		]);
	});

	test('should append the collection when dropped on the lower half of the last public collection', async ({
		visit,
		assert,
	}) => {
		const user = await createOwner('browser-dnd-lower-half');
		const moving = await createCollection({ author: user, name: MOVING_NAME });
		const anchor = await createCollection({
			author: user,
			name: ANCHOR_NAME,
			visibility: VISIBILITY.PUBLIC,
		});

		const page = await visit(LOGIN_PATH);
		await openDashboard(page, user);
		await card(page, MOVING_NAME).waitFor();
		await dragOnto(page, card(page, MOVING_NAME), card(page, ANCHOR_NAME), {
			offsetY: LOWER_HALF_OFFSET_PX,
		});

		const responsePromise = page.waitForResponse(isMoveRequest(moving.id));
		await page.getByRole('button', { name: 'Make public' }).click();
		await responsePromise;
		await page.waitForLoadState('networkidle');

		assert.deepEqual(await sectionOrder(user.id, VISIBILITY.PUBLIC), [
			anchor.id,
			moving.id,
		]);
	});

	test('should keep the collection private and in place when the drag confirmation is cancelled', async ({
		visit,
		assert,
	}) => {
		const user = await createOwner('browser-dnd-expose-cancel');
		const moving = await createCollection({ author: user, name: MOVING_NAME });
		await createCollection({
			author: user,
			name: ANCHOR_NAME,
			visibility: VISIBILITY.PUBLIC,
		});

		const page = await visit(LOGIN_PATH);
		await openDashboard(page, user);
		await card(page, MOVING_NAME).waitFor();
		await dragOnto(page, card(page, MOVING_NAME), card(page, ANCHOR_NAME));
		await page.getByRole('button', { name: 'Cancel' }).click();
		await page.getByRole('dialog').waitFor({ state: 'detached' });
		await page.waitForLoadState('networkidle');

		assert.equal(await readVisibility(moving.id), VISIBILITY.PRIVATE);
		assert.deepEqual(await sectionOrder(user.id, VISIBILITY.PRIVATE), [
			moving.id,
		]);
	});

	test('should save a public collection without followers as private directly when dropped on the private section', async ({
		visit,
		assert,
	}) => {
		const user = await createOwner('browser-dnd-hide-direct');
		const moving = await createCollection({
			author: user,
			name: MOVING_NAME,
			visibility: VISIBILITY.PUBLIC,
		});
		const anchor = await createCollection({
			author: user,
			name: ANCHOR_NAME,
			visibility: VISIBILITY.PRIVATE,
		});

		const page = await visit(LOGIN_PATH);
		await openDashboard(page, user);
		await card(page, MOVING_NAME).waitFor();
		const responsePromise = page.waitForResponse(isMoveRequest(moving.id));
		await dragOnto(page, card(page, MOVING_NAME), card(page, ANCHOR_NAME), {
			offsetY: -LOWER_HALF_OFFSET_PX,
		});
		await responsePromise;
		await page.waitForLoadState('networkidle');

		assert.deepEqual(await sectionOrder(user.id, VISIBILITY.PRIVATE), [
			moving.id,
			anchor.id,
		]);
	});

	test('should ask for the followers confirmation and remove the follower when a followed public collection is dragged to private', async ({
		visit,
		assert,
	}) => {
		const user = await createOwner('browser-dnd-hide-followers');
		const follower = await createUser({ emailPrefix: 'browser-dnd-follower' });
		const moving = await createCollection({
			author: user,
			name: MOVING_NAME,
			visibility: VISIBILITY.PUBLIC,
		});
		await createCollection({
			author: user,
			name: ANCHOR_NAME,
			visibility: VISIBILITY.PRIVATE,
		});
		await followCollection(moving, follower);

		const page = await visit(LOGIN_PATH);
		await openDashboard(page, user);
		await card(page, MOVING_NAME).waitFor();
		await dragOnto(page, card(page, MOVING_NAME), card(page, ANCHOR_NAME));
		await page
			.getByText('1 follower will lose access to this collection')
			.waitFor();
		assert.equal(await readVisibility(moving.id), VISIBILITY.PUBLIC);

		const responsePromise = page.waitForResponse(isMoveRequest(moving.id));
		await page.getByRole('button', { name: 'Make private' }).click();
		await responsePromise;
		await page.waitForLoadState('networkidle');

		assert.equal(await readVisibility(moving.id), VISIBILITY.PRIVATE);
		assert.equal(await followersCount(moving.id), 0);
	});

	test('should append the collection when dropped on an empty section', async ({
		visit,
		assert,
	}) => {
		const user = await createOwner('browser-dnd-empty-section');
		const moving = await createCollection({ author: user, name: MOVING_NAME });

		const page = await visit(LOGIN_PATH);
		await openDashboard(page, user);
		await card(page, MOVING_NAME).waitFor();
		await dragOnto(
			page,
			card(page, MOVING_NAME),
			sectionHeading(page, PUBLIC_SECTION_HEADING)
		);

		const responsePromise = page.waitForResponse(isMoveRequest(moving.id));
		await page.getByRole('button', { name: 'Make public' }).click();
		await responsePromise;
		await page.waitForLoadState('networkidle');

		assert.deepEqual(await sectionOrder(user.id, VISIBILITY.PUBLIC), [
			moving.id,
		]);
	});
});
