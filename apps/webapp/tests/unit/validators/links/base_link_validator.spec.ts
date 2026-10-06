import { test } from '@japa/runner';

import { MAXIMUM_URL_LENGTH } from '#constants/link';
import { createLinkValidator } from '#validators/links/create_link_validator';

const URL_PREFIX = 'https://example.com/?q=';
const LEGACY_URL_LIMIT = 2084;

function buildUrlOfLength(length: number): string {
	return URL_PREFIX + 'a'.repeat(length - URL_PREFIX.length);
}

function validateUrl(url: string) {
	return createLinkValidator.validate({
		name: 'Example',
		url,
		favorite: false,
		collectionIds: [],
	});
}

test.group('Base link validator url length', () => {
	test('should accept a URL longer than 2084 characters', async ({
		assert,
	}) => {
		const url = buildUrlOfLength(LEGACY_URL_LIMIT + 400);

		const validated = await validateUrl(url);

		assert.equal(validated.url, url);
	});

	test('should accept a URL of exactly the maximum length', async ({
		assert,
	}) => {
		const url = buildUrlOfLength(MAXIMUM_URL_LENGTH);

		const validated = await validateUrl(url);

		assert.equal(validated.url, url);
	});

	test('should reject a URL longer than the maximum length', async ({
		assert,
	}) => {
		const url = buildUrlOfLength(MAXIMUM_URL_LENGTH + 1);

		await assert.rejects(() => validateUrl(url));
	});
});
