import sharp from 'sharp';
import { test } from '@japa/runner';

import { FaviconNotFoundException } from '#exceptions/favicons/favicon_not_found_exception';
import {
	MAX_INPUT_PIXELS,
	FAVICON_MAX_DIMENSION,
	FaviconImageProcessor,
} from '#services/favicons/favicon_image_processor';

const BACKGROUND = { r: 200, g: 40, b: 40, alpha: 1 };

function createPng(width: number, height: number): Promise<Buffer> {
	return sharp({
		create: { width, height, channels: 4, background: BACKGROUND },
	})
		.png()
		.toBuffer();
}

function createJpeg(width: number, height: number): Promise<Buffer> {
	return sharp({
		create: { width, height, channels: 3, background: BACKGROUND },
	})
		.jpeg()
		.toBuffer();
}

test.group('FaviconImageProcessor.downscale', () => {
	test('should shrink a large png so its larger side fits the maximum', async ({
		assert,
	}) => {
		const processor = new FaviconImageProcessor();

		const processed = await processor.downscale(
			await createPng(512, 256),
			'image/png'
		);

		const { width, height } = await sharp(processed.buffer).metadata();
		assert.equal(width, FAVICON_MAX_DIMENSION);
		assert.equal(height, FAVICON_MAX_DIMENSION / 2);
	});

	test('should re-encode a large jpeg as png', async ({ assert }) => {
		const processor = new FaviconImageProcessor();

		const processed = await processor.downscale(
			await createJpeg(400, 400),
			'image/jpeg'
		);

		assert.equal(processed.type, 'image/png');
	});

	test('should leave a small image byte-for-byte untouched', async ({
		assert,
	}) => {
		const processor = new FaviconImageProcessor();
		const original = await createPng(64, 64);

		const processed = await processor.downscale(original, 'image/png');

		assert.isTrue(processed.buffer.equals(original));
		assert.equal(processed.type, 'image/png');
	});

	test('should leave an ico untouched', async ({ assert }) => {
		const processor = new FaviconImageProcessor();
		const ico = Buffer.from([0x00, 0x00, 0x01, 0x00, 0x01, 0x00]);

		const processed = await processor.downscale(ico, 'image/x-icon');

		assert.isTrue(processed.buffer.equals(ico));
		assert.equal(processed.type, 'image/x-icon');
	});

	test('should leave an svg untouched', async ({ assert }) => {
		const processor = new FaviconImageProcessor();
		const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

		const processed = await processor.downscale(svg, 'image/svg+xml');

		assert.isTrue(processed.buffer.equals(svg));
	});

	test('should reject a raster that sharp cannot decode', async ({
		assert,
	}) => {
		const processor = new FaviconImageProcessor();
		const corrupt = Buffer.from('not really a png');

		await assert.rejects(
			() => processor.downscale(corrupt, 'image/png'),
			/unreadable image\/png/
		);
	});

	test('should reject an image that exceeds the pixel limit', async ({
		assert,
	}) => {
		const processor = new FaviconImageProcessor();
		const side = Math.ceil(Math.sqrt(MAX_INPUT_PIXELS)) + 1;
		const oversized = await createPng(side, side);

		await assert.rejects(
			() => processor.downscale(oversized, 'image/png'),
			FaviconNotFoundException
		);
	});
});
