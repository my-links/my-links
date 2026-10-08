import type { FaviconHttpResponse } from '#types/favicon_http_response';

export type ImpersonatedFetchInit = {
	headers: Record<string, string>;
	signal: AbortSignal;
};

export abstract class ImpersonatedFetcher {
	abstract fetch(
		url: string,
		init: ImpersonatedFetchInit
	): Promise<FaviconHttpResponse>;
}
