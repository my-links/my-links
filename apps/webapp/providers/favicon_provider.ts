import type { ApplicationService } from '@adonisjs/core/types';

import { ImpitFetcher } from '#services/favicons/impit_fetcher';
import { ImpersonatedFetcher } from '#services/favicons/impersonated_fetcher';
import { FaviconFetchLimiter } from '#services/favicons/favicon_fetch_limiter';

/** The fetch limiter and the impersonated fetcher (one shared impit client) have to be shared across every per-request resolution service, so they need the singleton lifetime. */
export default class FaviconProvider {
	constructor(protected app: ApplicationService) {}

	register() {
		this.app.container.singleton(
			FaviconFetchLimiter,
			() => new FaviconFetchLimiter()
		);
		this.app.container.singleton(ImpersonatedFetcher, () => new ImpitFetcher());
	}
}
