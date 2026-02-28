import { CacheService } from '#services/favicons/cache_service';
import { FaviconService } from '#services/favicons/favicons_service';
import { Favicon } from '#types/favicons/favicon_type';
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http';
import app from '@adonisjs/core/services/app';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@inject()
export default class FaviconsController {
	private defaultFavicon: Favicon | null = null;

	constructor(
		protected readonly faviconService: FaviconService,
		protected readonly cacheService: CacheService
	) {}

	async render(ctx: HttpContext) {
		const url = ctx.request.qs()?.url;
		if (!url || typeof url !== 'string') {
			return this.sendDefaultFavicon(ctx);
		}

		try {
			const favicon = await this.cacheService.getOrSetFavicon(url, () =>
				this.faviconService.getFavicon(url)
			);
			return this.sendImage(ctx, favicon);
		} catch (error) {
			return this.sendDefaultFavicon(ctx);
		}
	}

	private sendImage(ctx: HttpContext, { buffer, type, size }: Favicon) {
		ctx.response.header('Content-Type', type);
		ctx.response.header('Content-Length', size.toString());
		ctx.response.header('Cache-Control', 'public, max-age=604800');
		ctx.response.send(buffer, true);
	}

	private sendDefaultFavicon(ctx: HttpContext) {
		const defaultFavicon = this.getDefaultFavicon();
		return this.sendImage(ctx, defaultFavicon);
	}

	private getDefaultFavicon(): Favicon {
		if (this.defaultFavicon) {
			return this.defaultFavicon;
		}

		const faviconPath = join(app.publicPath(), 'empty-image.png');
		const buffer = readFileSync(faviconPath);

		this.defaultFavicon = {
			buffer,
			url: '/favicon.png',
			type: 'image/png',
			size: buffer.length,
		};

		return this.defaultFavicon;
	}
}
