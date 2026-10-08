import dns from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import logger from '@adonisjs/core/services/logger';

import { UrlBlockedException } from '#exceptions/favicons/url_blocked_exception';
import { UnresolvableHostException } from '#exceptions/favicons/unresolvable_host_exception';

type DnsLookupResult = { address: string; family: number };
type HostnameResolver = (hostname: string) => Promise<DnsLookupResult[]>;

export type UrlCheckOutcome = 'allowed' | 'blocked' | 'unresolvable';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export class UrlValidatorService {
	private readonly blockedAddresses = new BlockList();
	private readonly localDomains = ['.local', '.localhost', '.internal', '.lan'];
	private readonly resolveHostname: HostnameResolver;

	constructor(
		resolveHostname: HostnameResolver = (hostname) =>
			dns.lookup(hostname, { all: true, verbatim: true })
	) {
		this.resolveHostname = resolveHostname;

		// Loopback, RFC1918 private ranges, link-local (incl. cloud metadata
		// endpoint), and "any" address.
		this.blockedAddresses.addSubnet('127.0.0.0', 8, 'ipv4');
		this.blockedAddresses.addSubnet('10.0.0.0', 8, 'ipv4');
		this.blockedAddresses.addSubnet('172.16.0.0', 12, 'ipv4');
		this.blockedAddresses.addSubnet('192.168.0.0', 16, 'ipv4');
		this.blockedAddresses.addSubnet('169.254.0.0', 16, 'ipv4');
		this.blockedAddresses.addSubnet('0.0.0.0', 8, 'ipv4');

		// IPv6 loopback, unique local (ULA), and link-local. IPv4-mapped
		// addresses (`::ffff:a.b.c.d`) need no separate rule: Node's
		// BlockList checks them against the ipv4 subnets above already.
		this.blockedAddresses.addSubnet('::1', 128, 'ipv6');
		this.blockedAddresses.addSubnet('fc00::', 7, 'ipv6');
		this.blockedAddresses.addSubnet('fe80::', 10, 'ipv6');
	}

	async isUrlAllowed(url: string): Promise<boolean> {
		return (await this.checkUrl(url)) === 'allowed';
	}

	async assertUrlAllowed(url: string): Promise<void> {
		const outcome = await this.checkUrl(url);
		if (outcome === 'blocked') {
			throw new UrlBlockedException(`URL is blocked: ${url}`);
		}
		if (outcome === 'unresolvable') {
			throw new UnresolvableHostException(`Host could not be resolved: ${url}`);
		}
	}

	async checkUrl(url: string): Promise<UrlCheckOutcome> {
		const parsedUrl = this.tryParseUrl(url);
		if (!parsedUrl) {
			return 'blocked';
		}

		if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
			logger.debug(`Blocked non-http(s) URL: ${url}`);
			return 'blocked';
		}

		const hostname = this.stripBrackets(parsedUrl.hostname.toLowerCase());

		if (this.isLocalDomain(hostname)) {
			logger.debug(`Blocked local domain URL: ${url}`);
			return 'blocked';
		}

		if (!this.isIpLiteral(hostname) && !this.isFullyQualified(hostname)) {
			logger.debug(`Blocked non-FQDN hostname: ${url}`);
			return 'blocked';
		}

		const resolvedAddresses = await this.resolveSafely(hostname);
		if (resolvedAddresses.length === 0) {
			logger.debug(`Blocked unresolvable hostname: ${url}`);
			return 'unresolvable';
		}

		if (resolvedAddresses.some((resolved) => this.isBlockedAddress(resolved))) {
			logger.debug(`Blocked internal/private target: ${url}`);
			return 'blocked';
		}

		return 'allowed';
	}

	private tryParseUrl(url: string): URL | undefined {
		try {
			return new URL(url);
		} catch (error) {
			logger.warn(`Invalid URL format: ${url}`, error);
			return undefined;
		}
	}

	private async resolveSafely(hostname: string): Promise<DnsLookupResult[]> {
		try {
			return await this.resolveHostname(hostname);
		} catch (error) {
			logger.debug(`DNS resolution failed for ${hostname}`, error);
			return [];
		}
	}

	private isBlockedAddress({ address, family }: DnsLookupResult): boolean {
		return this.blockedAddresses.check(address, family === 6 ? 'ipv6' : 'ipv4');
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
