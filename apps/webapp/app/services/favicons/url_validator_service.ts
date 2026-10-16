import dns from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import logger from '@adonisjs/core/services/logger';

import { UrlBlockedException } from '#exceptions/favicons/url_blocked_exception';
import { UnresolvableHostException } from '#exceptions/favicons/unresolvable_host_exception';

type DnsLookupResult = { address: string; family: number };
type HostnameResolver = (hostname: string) => Promise<DnsLookupResult[]>;

export type UrlCheckOutcome = 'allowed' | 'blocked' | 'unresolvable';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

type BlockedSubnet = readonly [network: string, prefixLength: number];

// Loopback, RFC1918, link-local (cloud metadata), "this network", CGNAT, IETF protocol assignments, benchmarking, multicast and reserved (incl. broadcast).
const BLOCKED_IPV4_SUBNETS: readonly BlockedSubnet[] = [
	['127.0.0.0', 8],
	['10.0.0.0', 8],
	['172.16.0.0', 12],
	['192.168.0.0', 16],
	['169.254.0.0', 16],
	['0.0.0.0', 8],
	['100.64.0.0', 10],
	['192.0.0.0', 24],
	['198.18.0.0', 15],
	['224.0.0.0', 4],
	['240.0.0.0', 4],
];

// Unspecified and IPv4-compatible, loopback, ULA, link-local, NAT64, 6to4, discard and multicast; `::ffff:a.b.c.d` is covered by the ipv4 list.
const BLOCKED_IPV6_SUBNETS: readonly BlockedSubnet[] = [
	['::', 96],
	['::1', 128],
	['fc00::', 7],
	['fe80::', 10],
	['64:ff9b::', 96],
	['2002::', 16],
	['100::', 64],
	['ff00::', 8],
];

export class UrlValidatorService {
	private readonly blockedAddresses = new BlockList();
	private readonly localDomains = ['.local', '.localhost', '.internal', '.lan'];
	private readonly resolveHostname: HostnameResolver;

	constructor(
		resolveHostname: HostnameResolver = (hostname) =>
			dns.lookup(hostname, { all: true, verbatim: true })
	) {
		this.resolveHostname = resolveHostname;

		BLOCKED_IPV4_SUBNETS.forEach(([network, prefix]) =>
			this.blockedAddresses.addSubnet(network, prefix, 'ipv4')
		);
		BLOCKED_IPV6_SUBNETS.forEach(([network, prefix]) =>
			this.blockedAddresses.addSubnet(network, prefix, 'ipv6')
		);
	}

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

		if (resolvedAddresses.some((resolved) => this.isBlockedAddress(resolved))) {
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

	private async resolveSafely(hostname: string): Promise<DnsLookupResult[]> {
		try {
			return await this.resolveHostname(hostname);
		} catch (error) {
			logger.debug({ err: error, hostname }, 'DNS resolution failed');
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
