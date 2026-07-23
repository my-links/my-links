import { storage } from 'wxt/utils/storage';

const LOCAL_DEV_INSTANCE_URL = 'http://localhost:3333';

// TODO: fill in the real public instance URL once confirmed — left empty
// (rather than a guessed domain) so production builds fall through to the
// options page onboarding empty-state instead of silently pointing at a
// wrong/unverified host.
const PUBLIC_INSTANCE_URL = '';

export const DEFAULT_INSTANCE_URL = import.meta.env.DEV
	? LOCAL_DEV_INSTANCE_URL
	: PUBLIC_INSTANCE_URL;

export const instanceUrlStorage = storage.defineItem<string>(
	'local:instanceUrl',
	{ fallback: DEFAULT_INSTANCE_URL }
);

export const apiTokenStorage = storage.defineItem<string | null>(
	'local:apiToken',
	{ fallback: null }
);

/**
 * Switching instances or logging out must never leak data across origins:
 * the token is instance-specific, and any cached API data (TanStack Query
 * cache) is invalidated by the caller once this resolves.
 */
export async function clearExtensionSession(): Promise<void> {
	await apiTokenStorage.removeValue();
}
