/**
 * Sign-in and sign-up are throttled per IP, and the memory limiter store
 * outlives a rolled back transaction. Giving every test its own forwarded
 * address keeps one test's attempts from spending another's budget. Loopback is
 * a trusted proxy (see `config/app.ts`), so the header is what `request.ip()`
 * resolves to.
 */
const TEST_NETWORK_PREFIX = '203.0.113';
const USABLE_HOSTS_PER_NETWORK = 254;

let clientAddressCounter = 0;

export function nextClientAddress(): string {
	clientAddressCounter += 1;

	return `${TEST_NETWORK_PREFIX}.${(clientAddressCounter % USABLE_HOSTS_PER_NETWORK) + 1}`;
}
