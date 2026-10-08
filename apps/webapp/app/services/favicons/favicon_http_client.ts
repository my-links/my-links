import { inject } from '@adonisjs/core';

import { isTimeoutError } from '#lib/favicons/timeout_error';
import { UrlValidatorService } from '#services/favicons/url_validator_service';
import { UrlBlockedException } from '#exceptions/favicons/url_blocked_exception';
import { FaviconNotFoundException } from '#exceptions/favicons/favicon_not_found_exception';

const MAX_HTML_BYTES = 256 * 1024;
const MAX_IMAGE_BYTES = 512 * 1024;

@inject()
export class FaviconHttpClient {
	private readonly userAgent =
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0';
	private readonly requestTimeout = 10000;
	private readonly maxRedirects = 5;

	constructor(private readonly urlValidator: UrlValidatorService) {}

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

	// Rejected mid-stream, not buffered then measured, a decompression bomb never sits fully in memory first.
	async readImageBodyCapped(
		body: ReadableStream<Uint8Array>,
		url: string
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
				if (totalBytes > MAX_IMAGE_BYTES) {
					throw new FaviconNotFoundException(`Image too large at ${url}`);
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
	): Promise<Response> {
		let targetUrl = url;

		for (let hop = 0; hop <= this.maxRedirects; hop += 1) {
			if (!(await this.urlValidator.isUrlAllowed(targetUrl))) {
				throw new UrlBlockedException(`URL is blocked: ${targetUrl}`);
			}

			const response = await this.fetchOnce(targetUrl, extraHeaders);

			if (!this.isRedirect(response.status)) {
				return response;
			}

			const location = response.headers.get('location');
			if (!location) {
				return response;
			}

			targetUrl = new URL(location, targetUrl).toString();
		}

		throw new FaviconNotFoundException(`Too many redirects for ${url}`);
	}

	private isRedirect(status: number): boolean {
		return status >= 300 && status < 400;
	}

	// The timeout signal stays attached to the response, so it also bounds the body read.
	async fetchOnce(
		url: string,
		extraHeaders: Record<string, string> = {}
	): Promise<Response> {
		try {
			return await fetch(url, {
				headers: new Headers({ 'User-Agent': this.userAgent, ...extraHeaders }),
				signal: AbortSignal.timeout(this.requestTimeout),
				redirect: 'manual',
			});
		} catch (error) {
			throw this.mapTimeout(error, 'timeout');
		}
	}

	private mapTimeout(error: unknown, message: string): unknown {
		return isTimeoutError(error)
			? new FaviconNotFoundException(message)
			: error;
	}
}
