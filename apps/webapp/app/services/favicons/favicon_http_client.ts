import { ProxyAgent } from 'undici';
import { inject } from '@adonisjs/core';
import logger from '@adonisjs/core/services/logger';

import { isTimeoutError } from '#lib/favicons/timeout_error';
import type { FaviconHttpResponse } from '#types/favicon_http_response';
import { EgressGuardProxy } from '#services/favicons/egress_guard_proxy';
import { ImpersonatedFetcher } from '#services/favicons/impersonated_fetcher';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import { UrlBlockedException } from '#exceptions/favicons/url_blocked_exception';
import {
	isBlockedStatus,
	isRetryableNetworkError,
} from '#lib/favicons/block_detection';
import { FaviconNotFoundException } from '#exceptions/favicons/favicon_not_found_exception';
import { UnresolvableHostException } from '#exceptions/favicons/unresolvable_host_exception';

const MAX_HTML_BYTES = 256 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 64 * 1024;

const CHROME_USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0';
const SLACKBOT_USER_AGENT =
	'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)';
const FACEBOOK_USER_AGENT =
	'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

// WAFs that block a spoofed browser usually let link-preview crawlers through.
const USER_AGENT_CASCADE = [
	CHROME_USER_AGENT,
	SLACKBOT_USER_AGENT,
	FACEBOOK_USER_AGENT,
];

@inject()
export class FaviconHttpClient {
	private readonly requestTimeout = 10000;
	private readonly maxRedirects = 5;
	private dispatcher?: Promise<NonNullable<RequestInit['dispatcher']>>;

	constructor(
		private readonly urlValidator: UrlValidatorService,
		private readonly impersonatedFetcher: ImpersonatedFetcher,
		private readonly egressGuard: EgressGuardProxy
	) {}

	// Cloudflare's default error page is ~1.3 MB; the icon declarations live in <head>, no need to buffer past it.
	async readBodyCapped(body: ReadableStream<Uint8Array>): Promise<string> {
		const reader = body.getReader();
		const chunks: Uint8Array[] = [];
		let totalBytes = 0;

		try {
			while (totalBytes < MAX_HTML_BYTES) {
				const { done, value } = await reader.read();
				if (done || !value) {
					break;
				}

				chunks.push(value);
				totalBytes += value.length;

				if (Buffer.concat(chunks).includes('</head>')) {
					break;
				}
			}
		} catch (error) {
			throw this.mapTimeout(error, 'timeout');
		} finally {
			await reader.cancel().catch(() => {});
		}

		return Buffer.concat(chunks).toString('utf8');
	}

	async readImageBodyCapped(body: ReadableStream<Uint8Array>): Promise<Buffer> {
		return this.readBufferCapped(body, MAX_IMAGE_BYTES);
	}

	async readManifestBodyCapped(
		body: ReadableStream<Uint8Array>
	): Promise<string> {
		const manifestBytes = await this.readBufferCapped(body, MAX_MANIFEST_BYTES);

		return manifestBytes.toString('utf8');
	}

	// Rejected mid-stream, not buffered then measured, a decompression bomb never sits fully in memory first.
	private async readBufferCapped(
		body: ReadableStream<Uint8Array>,
		maxBytes: number
	): Promise<Buffer> {
		const reader = body.getReader();
		const chunks: Uint8Array[] = [];
		let totalBytes = 0;

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done || !value) {
					break;
				}

				totalBytes += value.length;
				if (totalBytes > maxBytes) {
					throw new FaviconNotFoundException('too large');
				}

				chunks.push(value);
			}
		} catch (error) {
			throw this.mapTimeout(error, 'timeout');
		} finally {
			await reader.cancel().catch(() => {});
		}

		return Buffer.concat(chunks);
	}

	async fetchWithUserAgent(
		url: string,
		extraHeaders: Record<string, string> = {}
	): Promise<FaviconHttpResponse> {
		const impersonatedResponse = await this.tryFetchImpersonated(
			url,
			extraHeaders
		);
		if (impersonatedResponse && !isBlockedStatus(impersonatedResponse.status)) {
			return impersonatedResponse;
		}
		await impersonatedResponse?.body?.cancel().catch(() => {});

		return this.fetchWithUserAgentCascade(url, extraHeaders);
	}

	private async tryFetchImpersonated(
		url: string,
		extraHeaders: Record<string, string>
	): Promise<FaviconHttpResponse | undefined> {
		try {
			return await this.fetchFollowingRedirects(url, (targetUrl) =>
				this.fetchImpersonatedOnce(targetUrl, extraHeaders)
			);
		} catch (error) {
			if (this.isDomainException(error)) {
				throw error;
			}
			logger.debug({ err: error, url }, 'Impersonated fetch failed');
			return undefined;
		}
	}

	private isDomainException(error: unknown): boolean {
		return (
			error instanceof UrlBlockedException ||
			error instanceof UnresolvableHostException ||
			error instanceof FaviconNotFoundException
		);
	}

	private async fetchImpersonatedOnce(
		url: string,
		extraHeaders: Record<string, string>
	): Promise<FaviconHttpResponse> {
		try {
			return await this.impersonatedFetcher.fetch(url, {
				headers: extraHeaders,
				signal: AbortSignal.timeout(this.requestTimeout),
			});
		} catch (error) {
			throw this.mapTimeout(error, 'timeout');
		}
	}

	private async fetchWithUserAgentCascade(
		url: string,
		extraHeaders: Record<string, string>
	): Promise<FaviconHttpResponse> {
		const fallbackUserAgents = USER_AGENT_CASCADE.slice(0, -1);
		for (const userAgent of fallbackUserAgents) {
			const response = await this.tryFetchFollowingRedirects(
				url,
				userAgent,
				extraHeaders
			);
			if (response && !isBlockedStatus(response.status)) {
				return response;
			}
			await response?.body?.cancel().catch(() => {});
		}

		return this.fetchFollowingRedirects(url, (targetUrl) =>
			this.fetchOnce(
				targetUrl,
				extraHeaders,
				USER_AGENT_CASCADE[USER_AGENT_CASCADE.length - 1]
			)
		);
	}

	private async tryFetchFollowingRedirects(
		url: string,
		userAgent: string,
		extraHeaders: Record<string, string>
	): Promise<FaviconHttpResponse | undefined> {
		try {
			return await this.fetchFollowingRedirects(url, (targetUrl) =>
				this.fetchOnce(targetUrl, extraHeaders, userAgent)
			);
		} catch (error) {
			if (isRetryableNetworkError(error)) {
				return undefined;
			}
			throw error;
		}
	}

	private async fetchFollowingRedirects(
		url: string,
		fetchHop: (targetUrl: string) => Promise<FaviconHttpResponse>
	): Promise<FaviconHttpResponse> {
		let targetUrl = url;

		for (let hop = 0; hop <= this.maxRedirects; hop += 1) {
			await this.urlValidator.assertUrlAllowed(targetUrl);

			const response = await fetchHop(targetUrl);

			if (!this.isRedirect(response.status)) {
				return response;
			}

			const location = response.headers.get('location');
			if (!location) {
				return response;
			}

			targetUrl = new URL(location, targetUrl).toString();
		}

		throw new FaviconNotFoundException('too many redirects');
	}

	private isRedirect(status: number): boolean {
		return status >= 300 && status < 400;
	}

	// The timeout signal stays attached to the response, so it also bounds the body read.
	private async fetchOnce(
		url: string,
		extraHeaders: Record<string, string>,
		userAgent: string
	): Promise<FaviconHttpResponse> {
		try {
			const init: RequestInit = {
				headers: new Headers({ 'User-Agent': userAgent, ...extraHeaders }),
				signal: AbortSignal.timeout(this.requestTimeout),
				redirect: 'manual',
				dispatcher: await this.getDispatcher(),
			};
			return await fetch(url, init);
		} catch (error) {
			throw this.mapTimeout(error, 'timeout');
		}
	}

	// Every connection goes through the guard proxy, which connects to the address it vetted instead of resolving the host again.
	private getDispatcher(): Promise<NonNullable<RequestInit['dispatcher']>> {
		this.dispatcher ??= this.egressGuard
			.ensureStarted()
			.then(({ url, authorizationHeader }) => {
				const proxyUri = new URL(url);
				proxyUri.username = '';
				proxyUri.password = '';
				const proxyAgent = new ProxyAgent({
					uri: proxyUri.toString(),
					token: authorizationHeader,
				});
				// undici and @types/node ship distinct but runtime-compatible Dispatcher typings.
				return proxyAgent as unknown as NonNullable<RequestInit['dispatcher']>;
			});
		return this.dispatcher;
	}

	private mapTimeout(error: unknown, message: string): unknown {
		return isTimeoutError(error)
			? new FaviconNotFoundException(message)
			: error;
	}
}
