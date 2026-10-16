import type { ApplicationService } from '@adonisjs/core/types';

import { ImpitFetcher } from '#services/favicons/impit_fetcher';
import { EgressGuardProxy } from '#services/favicons/egress_guard_proxy';
import { ImpersonatedFetcher } from '#services/favicons/impersonated_fetcher';
import { FaviconFetchLimiter } from '#services/favicons/favicon_fetch_limiter';

/** The fetch limiter, the egress guard and the impersonated fetcher (one shared impit client) have to be shared across every per-request resolution service, so they need the singleton lifetime. */
export default class FaviconProvider {
	constructor(protected app: ApplicationService) {}

	register() {
		this.app.container.singleton(
			FaviconFetchLimiter,
			() => new FaviconFetchLimiter()
		);
		this.app.container.singleton(
			EgressGuardProxy,
			() => new EgressGuardProxy()
		);
		this.app.container.singleton(
			ImpersonatedFetcher,
			async (resolver) =>
				new ImpitFetcher(await resolver.make(EgressGuardProxy))
		);
	}

	async shutdown() {
		const egressGuard = await this.app.container.make(EgressGuardProxy);
		await egressGuard.stop();
	}
}
