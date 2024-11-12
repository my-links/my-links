import { CacheService } from '#favicons/services/cache_service';
import { FaviconService } from '#favicons/services/favicons_service';
import { Favicon } from '#favicons/types/favicon_type';
import type { HttpContext } from '@adonisjs/core/http';

export default class FaviconsController {
	private faviconService: FaviconService;
	private cacheService: CacheService;

	constructor(faviconService: FaviconService, cacheService: CacheService) {
		this.faviconService = faviconService;
		this.cacheService = cacheService;
	}

	async index(ctx: HttpContext) {
		const url = ctx.request.qs()?.url;
		if (!url) {
			throw new Error('Missing URL');
		}

		const favicon = await this.cacheService.getOrSetFavicon(url, () =>
			this.faviconService.getFavicon(url)
		);
		return this.sendImage(ctx, favicon);
	}

	private sendImage(ctx: HttpContext, { buffer, type, size }: Favicon) {
		ctx.response.header('Content-Type', type);
		ctx.response.header('Content-Length', size.toString());
		ctx.response.send(buffer, true);
	}
}
