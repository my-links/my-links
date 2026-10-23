import { test } from '@japa/runner';
import { errors } from '@vinejs/vine';

import {
	MAXIMUM_DATABASE_ID,
	MAXIMUM_ID_LIST_LENGTH,
} from '#constants/database';
import { bulkDeleteUsersValidator } from '#validators/admin/bulk_delete_users_validator';
import { collectionIdValidator } from '#validators/collections/collection_id_validator';
import { createLinkValidator } from '#validators/links/create_link_validator';

const OUT_OF_RANGE_ID = MAXIMUM_DATABASE_ID + 1;

function collectionIdPayload(id: number) {
	return { params: { id } };
}

test.group('Bounded ids: route params', () => {
	test('should not crash on an out-of-range link id', async ({ client }) => {
		const response = await client
			.post(`/l/${OUT_OF_RANGE_ID}`)
			.withCsrfToken()
			.redirects(0);

		response.assertStatus(302);
	});

	test('should not crash on an out-of-range shared collection id', async ({
		client,
	}) => {
		const response = await client
			.get(`/shared/${OUT_OF_RANGE_ID}`)
			.redirects(0);

		response.assertStatus(302);
	});

	test('should not crash on a decimal link id', async ({ client }) => {
		const response = await client.post('/l/1.5').withCsrfToken().redirects(0);

		response.assertStatus(302);
	});
});

test.group('Bounded ids: validators', () => {
	test('should accept the largest valid id', async ({ assert }) => {
		const validated = await collectionIdValidator.validate(
			collectionIdPayload(MAXIMUM_DATABASE_ID)
		);

		assert.equal(validated.params.id, MAXIMUM_DATABASE_ID);
	});

	test('should refuse an id above the integer range', async ({ assert }) => {
		await assert.rejects(
			() =>
				collectionIdValidator.validate(collectionIdPayload(OUT_OF_RANGE_ID)),
			errors.E_VALIDATION_ERROR
		);
	});

	test('should refuse a negative id', async ({ assert }) => {
		await assert.rejects(
			() => collectionIdValidator.validate(collectionIdPayload(-1)),
			errors.E_VALIDATION_ERROR
		);
	});

	test('should refuse a decimal id', async ({ assert }) => {
		await assert.rejects(
			() => collectionIdValidator.validate(collectionIdPayload(1.5)),
			errors.E_VALIDATION_ERROR
		);
	});

	test('should refuse an id list longer than the maximum', async ({
		assert,
	}) => {
		const oversizedCollectionIds = Array.from(
			{ length: MAXIMUM_ID_LIST_LENGTH + 1 },
			(_, index) => index + 1
		);

		await assert.rejects(
			() =>
				createLinkValidator.validate({
					name: 'Link',
					url: 'https://example.com',
					favorite: false,
					collectionIds: oversizedCollectionIds,
				}),
			errors.E_VALIDATION_ERROR
		);
	});

	test('should refuse a bulk delete list with an out-of-range id', async ({
		assert,
	}) => {
		await assert.rejects(
			() => bulkDeleteUsersValidator.validate({ userIds: [OUT_OF_RANGE_ID] }),
			errors.E_VALIDATION_ERROR
		);
	});
});
