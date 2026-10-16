import dns from 'node:dns/promises';

import type { ResolvedAddress } from '#lib/network/blocked_address_list';

export type HostnameResolver = (hostname: string) => Promise<ResolvedAddress[]>;

export const resolveHostnameWithDns: HostnameResolver = (hostname) =>
	dns.lookup(hostname, { all: true, verbatim: true });
