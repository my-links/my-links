import { Impit } from 'impit';

import type { FaviconHttpResponse } from '#types/favicon_http_response';
import {
	ImpersonatedFetcher,
	type ImpersonatedFetchInit,
} from '#services/favicons/impersonated_fetcher';

export class ImpitFetcher extends ImpersonatedFetcher {
	private readonly impit = new Impit({
		browser: 'chrome',
		followRedirects: false,
	});

	async fetch(
		url: string,
		{ headers, signal }: ImpersonatedFetchInit
	): Promise<FaviconHttpResponse> {
		return this.impit.fetch(url, { headers, signal, redirect: 'manual' });
	}
}
