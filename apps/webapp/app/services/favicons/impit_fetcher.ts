import { Impit } from 'impit';

import type { FaviconHttpResponse } from '#types/favicon_http_response';
import { EgressGuardProxy } from '#services/favicons/egress_guard_proxy';
import {
	ImpersonatedFetcher,
	type ImpersonatedFetchInit,
} from '#services/favicons/impersonated_fetcher';

export class ImpitFetcher extends ImpersonatedFetcher {
	private impit?: Promise<Impit>;

	constructor(private readonly egressGuard: EgressGuardProxy) {
		super();
	}

	async fetch(
		url: string,
		{ headers, signal }: ImpersonatedFetchInit
	): Promise<FaviconHttpResponse> {
		const impit = await this.getImpit();
		return impit.fetch(url, { headers, signal, redirect: 'manual' });
	}

	// impit has no lookup hook, so every connection goes through the guard proxy that vets the resolved address.
	private getImpit(): Promise<Impit> {
		this.impit ??= this.egressGuard.ensureStarted().then(
			({ url }) =>
				new Impit({
					browser: 'chrome',
					followRedirects: false,
					proxyUrl: url,
				})
		);
		return this.impit;
	}
}
