import { test } from '@japa/runner';

import { sniffImageType } from '#services/favicons/image_sniffer';

test.group('sniffImageType', () => {
	test('should identify a PNG by its magic bytes', ({ assert }) => {
		const buffer = Buffer.from([
			0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
		]);

		assert.equal(sniffImageType(buffer), 'image/png');
	});

	test('should identify a JPEG by its magic bytes', ({ assert }) => {
		const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

		assert.equal(sniffImageType(buffer), 'image/jpeg');
	});

	test('should identify an ICO served with the wrong Content-Type', ({
		assert,
	}) => {
		// A real-world case: a valid .ico served as application/octet-stream,
		// which a Content-Type-only check would reject.
		const buffer = Buffer.from([0x00, 0x00, 0x01, 0x00, 0x01, 0x00]);

		assert.equal(sniffImageType(buffer), 'image/x-icon');
	});

	test('should identify a WebP by its RIFF/WEBP markers', ({ assert }) => {
		const buffer = Buffer.concat([
			Buffer.from('RIFF', 'ascii'),
			Buffer.from([0x00, 0x00, 0x00, 0x00]),
			Buffer.from('WEBP', 'ascii'),
		]);

		assert.equal(sniffImageType(buffer), 'image/webp');
	});

	test('should identify an SVG document', ({ assert }) => {
		const buffer = Buffer.from(
			'<svg xmlns="http://www.w3.org/2000/svg"></svg>',
			'utf8'
		);

		assert.equal(sniffImageType(buffer), 'image/svg+xml');
	});

	test('should return undefined for non-image bytes', ({ assert }) => {
		const buffer = Buffer.from('<!DOCTYPE html><html></html>', 'utf8');

		assert.isUndefined(sniffImageType(buffer));
	});

	test('should return undefined for an empty buffer', ({ assert }) => {
		assert.isUndefined(sniffImageType(Buffer.alloc(0)));
	});
});
