import type { ApplicationService } from '@adonisjs/core/types';

import { FaviconFetchLimiter } from '#services/favicons/favicon_fetch_limiter';

/** The fetch limiter has to be shared across every per-request resolution service, so it needs the singleton lifetime. */
export default class FaviconProvider {
	constructor(protected app: ApplicationService) {}

	register() {
		this.app.container.singleton(
			FaviconFetchLimiter,
			() => new FaviconFetchLimiter()
		);
	}
}
