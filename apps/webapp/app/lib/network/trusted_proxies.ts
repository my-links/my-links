import proxyaddr from 'proxy-addr';

import { InvalidTrustedProxiesConfigException } from '#exceptions/network/invalid_trusted_proxies_config_exception';

const TRUSTED_PROXIES_SEPARATOR = ',';

export const DEFAULT_TRUSTED_PROXIES: readonly string[] = [
	'loopback',
	'uniquelocal',
	'linklocal',
	'10.0.0.0/8',
];

type TrustProxyFunction = ReturnType<typeof proxyaddr.compile>;

/**
 * Parses the `TRUSTED_PROXIES` env value. Doubles as an `Env.schema` validator:
 * a malformed entry stops the boot instead of silently trusting the wrong hops.
 */
export function parseTrustedProxies(
	_key: string,
	rawValue?: string
): readonly string[] | undefined {
	const entries = (rawValue ?? '')
		.split(TRUSTED_PROXIES_SEPARATOR)
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);

	if (entries.length === 0) return undefined;

	entries.forEach(assertValidTrustedProxy);

	return entries;
}

/** The configured list replaces the default one entirely. */
export function resolveTrustProxy(
	configuredProxies?: readonly string[]
): TrustProxyFunction {
	return proxyaddr.compile([...(configuredProxies ?? DEFAULT_TRUSTED_PROXIES)]);
}

function assertValidTrustedProxy(entry: string): void {
	try {
		proxyaddr.compile(entry);
	} catch {
		throw new InvalidTrustedProxiesConfigException(entry);
	}
}
