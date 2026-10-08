import { test } from '@japa/runner';

import { decodeDataUri } from '#lib/favicons/data_uri';

test.group('decodeDataUri', () => {
	test('should decode a base64 payload', ({ assert }) => {
		const encoded = Buffer.from('<svg></svg>').toString('base64');

		const buffer = decodeDataUri(`data:image/svg+xml;base64,${encoded}`);

		assert.equal(buffer?.toString('utf8'), '<svg></svg>');
	});

	test('should decode a percent-encoded payload', ({ assert }) => {
		const buffer = decodeDataUri(
			'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22></svg>'
		);

		assert.equal(
			buffer?.toString('utf8'),
			'<svg xmlns="http://www.w3.org/2000/svg"></svg>'
		);
	});

	test('should keep plus signs of a percent-encoded payload literal', ({
		assert,
	}) => {
		const buffer = decodeDataUri('data:image/svg+xml,<svg>a+b</svg>');

		assert.equal(buffer?.toString('utf8'), '<svg>a+b</svg>');
	});

	test('should keep commas that appear inside the payload', ({ assert }) => {
		const buffer = decodeDataUri('data:image/svg+xml,<svg a="1,2"></svg>');

		assert.equal(buffer?.toString('utf8'), '<svg a="1,2"></svg>');
	});

	test('should return undefined for a malformed percent sequence', ({
		assert,
	}) => {
		assert.isUndefined(decodeDataUri('data:image/svg+xml,<svg>%E0%A4%A</svg>'));
	});

	test('should return undefined when the payload separator is missing', ({
		assert,
	}) => {
		assert.isUndefined(decodeDataUri('data:image/png;base64'));
	});

	test('should decode a uri that went through the URL parser', ({ assert }) => {
		const resolved = new URL(
			'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22></svg>',
			'https://example.com'
		).toString();

		assert.equal(
			decodeDataUri(resolved)?.toString('utf8'),
			'<svg xmlns="http://www.w3.org/2000/svg"></svg>'
		);
	});
});
