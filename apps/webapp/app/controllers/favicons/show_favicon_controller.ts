import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { inject } from '@adonisjs/core';
import app from '@adonisjs/core/services/app';
import type { HttpContext } from '@adonisjs/core/http';

import { Favicon } from '#types/favicon_type';
import { renderFaviconValidator } from '#validators/favicons/render_favicon_validator';
import { FaviconResolutionService } from '#services/favicons/favicon_resolution_service';

@inject()
export default class ShowFaviconController {
	private defaultFavicon: Favicon | null = null;

	constructor(protected readonly resolutionService: FaviconResolutionService) {}

	async render(ctx: HttpContext) {
		const { url } = await ctx.request.validateUsing(renderFaviconValidator, {
			data: ctx.request.qs(),
		});
		if (!url) {
			return this.sendDefaultFavicon(ctx);
		}

		const favicon = await this.resolutionService.getFreshOrStale(url);
		return this.sendImage(ctx, favicon);
	}

	private sendImage(
		ctx: HttpContext,
		{ buffer, type, size, isPlaceholder }: Favicon
	) {
		ctx.response.header('Content-Type', type);
		ctx.response.header('Content-Length', size.toString());
		// A placeholder stands in for a resolution still running, so caching it long would hide the real icon.
		ctx.response.header(
			'Cache-Control',
			isPlaceholder ? 'no-store' : 'public, max-age=604800'
		);
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
