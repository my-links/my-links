import sharp from 'sharp';
import { inject } from '@adonisjs/core';

import { FaviconNotFoundException } from '#exceptions/favicons/favicon_not_found_exception';

export const FAVICON_MAX_DIMENSION = 128;
export const MAX_INPUT_PIXELS = 4096 * 4096;

const DOWNSCALABLE_TYPES = new Set([
	'image/png',
	'image/jpeg',
	'image/webp',
	'image/gif',
]);
const DOWNSCALED_TYPE = 'image/png';

export type ProcessedImage = {
	buffer: Buffer;
	type: string;
};

@inject()
export class FaviconImageProcessor {
	/** Rasters larger than `FAVICON_MAX_DIMENSION` become PNGs; ICO and SVG pass through untouched. */
	async downscale(buffer: Buffer, type: string): Promise<ProcessedImage> {
		if (!DOWNSCALABLE_TYPES.has(type)) {
			return { buffer, type };
		}

		try {
			return await this.downscaleRaster(buffer, type);
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			throw new FaviconNotFoundException(`unreadable ${type}: ${reason}`);
		}
	}

	private async downscaleRaster(
		buffer: Buffer,
		type: string
	): Promise<ProcessedImage> {
		const image = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS });
		const { width, height } = await image.metadata();
		if (Math.max(width, height) <= FAVICON_MAX_DIMENSION) {
			return { buffer, type };
		}

		const resized = await image
			.resize(FAVICON_MAX_DIMENSION, FAVICON_MAX_DIMENSION, {
				fit: 'inside',
				withoutEnlargement: true,
			})
			.png()
			.toBuffer();
		return { buffer: resized, type: DOWNSCALED_TYPE };
	}
}
