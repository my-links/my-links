import { isIP } from 'node:net';

const IPV4_KEPT_OCTETS = 3;
const IPV6_KEPT_HEXTETS = 3;
const IPV6_HEXTET_COUNT = 8;
const IPV4_MAPPED_PREFIX_HEXTETS = [0, 0, 0, 0, 0, 0xffff];
const HEXTET_RADIX = 16;
const BITS_PER_OCTET = 8;
const BITS_PER_HEXTET = 16;
const OCTET_MASK = 0xff;

function maskIpv4(address: string): string {
	const keptOctets = address.split('.').slice(0, IPV4_KEPT_OCTETS);

	return `${keptOctets.join('.')}.0/${IPV4_KEPT_OCTETS * BITS_PER_OCTET}`;
}

function convertTrailingIpv4ToHextets(address: string): string {
	const lastColonIndex = address.lastIndexOf(':');
	const trailing = address.slice(lastColonIndex + 1);
	if (isIP(trailing) !== 4) return address;

	const [first, second, third, fourth] = trailing.split('.').map(Number);
	const highHextet = ((first << BITS_PER_OCTET) | second).toString(
		HEXTET_RADIX
	);
	const lowHextet = ((third << BITS_PER_OCTET) | fourth).toString(HEXTET_RADIX);

	return `${address.slice(0, lastColonIndex + 1)}${highHextet}:${lowHextet}`;
}

function expandIpv6(address: string): number[] {
	const [head, tail] = convertTrailingIpv4ToHextets(address).split('::');
	const headHextets = head ? head.split(':') : [];
	const tailHextets = tail ? tail.split(':') : [];
	const zeroCount = IPV6_HEXTET_COUNT - headHextets.length - tailHextets.length;
	const hextets = [
		...headHextets,
		...Array<string>(Math.max(zeroCount, 0)).fill('0'),
		...tailHextets,
	];

	return hextets.map((hextet) => parseInt(hextet, HEXTET_RADIX));
}

function isIpv4Mapped(hextets: readonly number[]): boolean {
	return IPV4_MAPPED_PREFIX_HEXTETS.every(
		(expected, index) => hextets[index] === expected
	);
}

function unmapIpv4(hextets: readonly number[]): string {
	const [high, low] = hextets.slice(-2);

	return [
		high >> BITS_PER_OCTET,
		high & OCTET_MASK,
		low >> BITS_PER_OCTET,
		low & OCTET_MASK,
	].join('.');
}

function maskIpv6(address: string): string {
	const hextets = expandIpv6(address);
	if (isIpv4Mapped(hextets)) return maskIpv4(unmapIpv4(hextets));

	const keptHextets = hextets
		.slice(0, IPV6_KEPT_HEXTETS)
		.map((hextet) => hextet.toString(HEXTET_RADIX));

	return `${keptHextets.join(':')}::/${IPV6_KEPT_HEXTETS * BITS_PER_HEXTET}`;
}

/**
 * Reduces an address to the network it belongs to: the /24 of an IPv4
 * address, the /48 of an IPv6 one, an IPv4-mapped IPv6 address being treated
 * as the IPv4 it wraps. Anything that is not an address yields null rather
 * than being echoed back.
 */
export function maskIp(address: string | null | undefined): string | null {
	if (!address) return null;

	const bareAddress = address.split('%')[0];
	const version = isIP(bareAddress);
	if (version === 4) return maskIpv4(bareAddress);
	if (version === 6) return maskIpv6(bareAddress);

	return null;
}
