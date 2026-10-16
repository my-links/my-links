import { isIP } from 'node:net';
import logger from '@adonisjs/core/services/logger';

import { UrlBlockedException } from '#exceptions/favicons/url_blocked_exception';
import { UnresolvableHostException } from '#exceptions/favicons/unresolvable_host_exception';
import {
	isBlockedAddress,
	type ResolvedAddress,
} from '#lib/network/blocked_address_list';
import {
	type HostnameResolver,
	resolveHostnameWithDns,
} from '#lib/network/hostname_resolver';

export type UrlCheckOutcome = 'allowed' | 'blocked' | 'unresolvable';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export class UrlValidatorService {
	private readonly localDomains = ['.local', '.localhost', '.internal', '.lan'];

	constructor(
		private readonly resolveHostname: HostnameResolver = resolveHostnameWithDns
	) {}

	async isUrlAllowed(url: string): Promise<boolean> {
		return (await this.checkUrl(url)) === 'allowed';
	}

	async assertUrlAllowed(url: string): Promise<void> {
		const outcome = await this.checkUrl(url);
		if (outcome === 'blocked') {
			throw new UrlBlockedException('URL is blocked');
		}
		if (outcome === 'unresolvable') {
			throw new UnresolvableHostException('Host could not be resolved');
		}
	}

	async checkUrl(url: string): Promise<UrlCheckOutcome> {
		const parsedUrl = this.tryParseUrl(url);
		if (!parsedUrl) {
			return 'blocked';
		}

		if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
			logger.debug({ url }, 'Blocked non-http(s) URL');
			return 'blocked';
		}

		const hostname = this.stripBrackets(parsedUrl.hostname.toLowerCase());

		if (this.isLocalDomain(hostname)) {
			logger.debug({ url }, 'Blocked local domain URL');
			return 'blocked';
		}

		if (!this.isIpLiteral(hostname) && !this.isFullyQualified(hostname)) {
			logger.debug({ url }, 'Blocked non-FQDN hostname');
			return 'blocked';
		}

		const resolvedAddresses = await this.resolveSafely(hostname);
		if (resolvedAddresses.length === 0) {
			logger.debug({ url }, 'Blocked unresolvable hostname');
			return 'unresolvable';
		}

		if (resolvedAddresses.some((resolved) => isBlockedAddress(resolved))) {
			logger.debug({ url }, 'Blocked internal/private target');
			return 'blocked';
		}

		return 'allowed';
	}

	private tryParseUrl(url: string): URL | undefined {
		try {
			return new URL(url);
		} catch (error) {
			logger.debug({ err: error, url }, 'Invalid URL format');
			return undefined;
		}
	}

	private async resolveSafely(hostname: string): Promise<ResolvedAddress[]> {
		try {
			return await this.resolveHostname(hostname);
		} catch (error) {
			logger.debug({ err: error, hostname }, 'DNS resolution failed');
			return [];
		}
	}

	private stripBrackets(hostname: string): string {
		return hostname.startsWith('[') && hostname.endsWith(']')
			? hostname.slice(1, -1)
			: hostname;
	}

	private isIpLiteral(hostname: string): boolean {
		return isIP(hostname) !== 0;
	}

	private isFullyQualified(hostname: string): boolean {
		return hostname.includes('.');
	}

	private isLocalDomain(hostname: string): boolean {
		return this.localDomains.some((domain) => hostname.endsWith(domain));
	}
}
