import { createHmac } from 'node:crypto';

/**
 * Keys the per-account throttle by a keyed digest of the submitted email, so
 * the rate-limit table cannot be reversed with a dictionary of addresses
 * without also holding the app key. The same email always maps to the same key.
 */
export function deriveAccountThrottleKey(
	normalizedEmail: string,
	secret: string
): string {
	return createHmac('sha256', secret).update(normalizedEmail).digest('hex');
}
