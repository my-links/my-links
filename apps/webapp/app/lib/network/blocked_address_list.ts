import { BlockList } from 'node:net';

export type ResolvedAddress = { address: string; family: number };

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

function buildBlockList(): BlockList {
	const blockList = new BlockList();
	BLOCKED_IPV4_SUBNETS.forEach(([network, prefix]) =>
		blockList.addSubnet(network, prefix, 'ipv4')
	);
	BLOCKED_IPV6_SUBNETS.forEach(([network, prefix]) =>
		blockList.addSubnet(network, prefix, 'ipv6')
	);
	return blockList;
}

const blockedAddresses = buildBlockList();

/** Single source of truth for addresses outbound fetches must never reach. */
export function isBlockedAddress({
	address,
	family,
}: ResolvedAddress): boolean {
	return blockedAddresses.check(address, family === 6 ? 'ipv6' : 'ipv4');
}
