import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { inject } from '@adonisjs/core';
import app from '@adonisjs/core/services/app';
import type { HttpContext } from '@adonisjs/core/http';

import { Favicon } from '#types/favicon_type';
import { CacheService } from '#services/favicons/cache_service';
import { FaviconService } from '#services/favicons/favicons_service';
import UrlBlockedException from '#exceptions/favicons/url_blocked_exception';
import { faviconFetchLimiter } from '#services/favicons/concurrency_limiter';
import FaviconNotFoundException from '#exceptions/favicons/favicon_not_found_exception';

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
				faviconFetchLimiter.run(() => this.faviconService.getFavicon(url))
			);
			return this.sendImage(ctx, favicon);
		} catch (error) {
			// A site with no favicon, or one we refuse to fetch from, is an
			// expected outcome served as the placeholder. Anything else is a
			// fault of ours and has to surface: catching it too made a bug in
			// this controller indistinguishable from a dead remote host.
			if (
				error instanceof FaviconNotFoundException ||
				error instanceof UrlBlockedException
			) {
				return this.sendDefaultFavicon(ctx);
			}

			throw error;
		}
	}

	private sendImage(ctx: HttpContext, { buffer, type, size }: Favicon) {
		ctx.response.header('Content-Type', type);
		ctx.response.header('Content-Length', size.toString());
		ctx.response.header('Cache-Control', 'public, max-age=604800');
		// Defense in depth for a navigated-to SVG served from this route.
		ctx.response.header('Content-Security-Policy', 'sandbox');
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
