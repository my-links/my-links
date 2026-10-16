import { fetchAccountIdentity } from '@/lib/api/account_identity';
import {
	accountIdentityStorage,
	apiTokenStorage,
	clearAccountBoundData,
	clearExtensionSession,
	instanceUrlStorage,
} from '@/lib/storage';

export class ExtensionAuthError extends Error {}

export class InsecureInstanceUrlError extends ExtensionAuthError {
	constructor() {
		super(
			'Use an https:// URL. Plain http is only allowed for localhost and loopback addresses.'
		);
	}
}

const LOOPBACK_IPV4_PATTERN = /^127(\.\d{1,3}){3}$/;
const LOOPBACK_IPV6_HOSTNAME = '[::1]';
const LOCALHOST_HOSTNAME = 'localhost';

function isLoopbackHostname(hostname: string): boolean {
	return (
		hostname === LOCALHOST_HOSTNAME ||
		hostname.endsWith(`.${LOCALHOST_HOSTNAME}`) ||
		hostname === LOOPBACK_IPV6_HOSTNAME ||
		LOOPBACK_IPV4_PATTERN.test(hostname)
	);
}

function isAllowedInstanceUrl(url: URL): boolean {
	if (url.protocol === 'https:') {
		return true;
	}
	return url.protocol === 'http:' && isLoopbackHostname(url.hostname);
}

export class AuthorizationDeclinedError extends ExtensionAuthError {
	constructor() {
		super('Authorization was cancelled.');
	}
}

const ACCESS_DENIED_ERROR = 'access_denied';

export function normalizeInstanceUrl(rawInstanceUrl: string): string {
	const url = new URL(rawInstanceUrl.trim());
	if (!isAllowedInstanceUrl(url)) {
		throw new InsecureInstanceUrlError();
	}
	return url.origin;
}

function withWwwPrefix(origin: string): string | null {
	const url = new URL(origin);
	if (url.hostname.startsWith('www.')) {
		return null;
	}
	url.hostname = `www.${url.hostname}`;
	return url.origin;
}

function withoutWwwPrefix(origin: string): string | null {
	const url = new URL(origin);
	if (!url.hostname.startsWith('www.')) {
		return null;
	}
	url.hostname = url.hostname.slice('www.'.length);
	return url.origin;
}

// Both origin/www variants, requested up front since resolveCanonicalOrigin's network check can't run before permissions.request on Firefox.
function permissionOriginPatterns(origin: string): string[] {
	const wwwVariant = withWwwPrefix(origin) ?? withoutWwwPrefix(origin);
	const origins = [origin];
	if (wwwVariant) {
		origins.push(wwwVariant);
	}
	return origins.map((candidate) => `${candidate}/*`);
}

/**
 * `redirect: 'error'` instead of the default `'follow'`: a cross-origin 30x
 * carries no CORS headers of its own, so the browser blocks it as a CORS
 * failure before it ever reaches the final response: following it is not an
 * option here, only detecting it is.
 */
async function answersDirectly(origin: string): Promise<boolean> {
	try {
		await fetch(`${origin}/api/v1/health`, { redirect: 'error' });
		return true;
	} catch {
		return false;
	}
}

/**
 * A typed origin can redirect to a different one (apex to `www` is the
 * common case) and that redirect is opaque to `fetch`, so this tries the
 * typed origin first and falls back to its `www` sibling before giving up:
 * whichever answers without redirecting is the one every later request,
 * bearer token included, must target directly.
 */
export async function resolveCanonicalOrigin(origin: string): Promise<string> {
	if (await answersDirectly(origin)) {
		return origin;
	}

	const wwwOrigin = withWwwPrefix(origin);
	if (wwwOrigin && (await answersDirectly(wwwOrigin))) {
		return wwwOrigin;
	}

	throw new ExtensionAuthError(
		'Could not reach the instance. Check the URL and try again.'
	);
}

export function extractTokenFromAuthCallback(
	callbackUrl: string
): string | null {
	const fragment = callbackUrl.split('#')[1] ?? '';
	return new URLSearchParams(fragment).get('token');
}

export function extractErrorFromAuthCallback(
	callbackUrl: string
): string | null {
	const fragment = callbackUrl.split('#')[1] ?? '';
	return new URLSearchParams(fragment).get('error');
}

/**
 * Requests host permission for the instance origin, then hands the whole
 * auth handoff off to `launchWebAuthFlow`: it opens
 * `/extension/authorize?redirect_uri=...` on the instance (login there if
 * needed), and captures the final redirect once the server hands back a
 * token in the URL fragment. MyLinks is never an OAuth provider here: this
 * only reuses the browser API that OAuth flows also happen to use.
 * Permission request stays first (before resolveCanonicalOrigin's fetch) since Firefox requires it synchronous within the click handler.
 */
export async function connectToInstance(rawInstanceUrl: string): Promise<void> {
	const typedOrigin = normalizeInstanceUrl(rawInstanceUrl);

	const granted = await browser.permissions.request({
		origins: permissionOriginPatterns(typedOrigin),
	});
	if (!granted) {
		throw new ExtensionAuthError(
			'Permission was refused for this instance URL.'
		);
	}

	const instanceUrl = await resolveCanonicalOrigin(typedOrigin);

	const redirectUri = browser.identity.getRedirectURL();
	const authorizeUrl = `${instanceUrl}/extension/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;

	const callbackUrl = await browser.identity.launchWebAuthFlow({
		url: authorizeUrl,
		interactive: true,
	});

	if (!callbackUrl) {
		throw new ExtensionAuthError('Authentication was cancelled.');
	}

	if (extractErrorFromAuthCallback(callbackUrl) === ACCESS_DENIED_ERROR) {
		throw new AuthorizationDeclinedError();
	}

	const token = extractTokenFromAuthCallback(callbackUrl);
	if (!token) {
		throw new ExtensionAuthError('The instance did not return a token.');
	}

	await dropDataOfPreviousAccount(instanceUrl, token);

	await instanceUrlStorage.setValue(instanceUrl);
	await apiTokenStorage.setValue(token);
}

/**
 * Runs before the new token is stored so no sync can ever see the previous
 * account's cache or bookmark mapping next to the new session. An unknown
 * identity on either side counts as a different account.
 */
async function dropDataOfPreviousAccount(
	instanceUrl: string,
	token: string
): Promise<void> {
	const connectedIdentity = await fetchAccountIdentity(instanceUrl, token);
	const storedIdentity = await accountIdentityStorage.getValue();

	if (connectedIdentity === null || connectedIdentity !== storedIdentity) {
		await clearAccountBoundData();
	}
	await accountIdentityStorage.setValue(connectedIdentity);
}

export async function disconnectFromInstance(): Promise<void> {
	const instanceUrl = await instanceUrlStorage.getValue();
	await clearExtensionSession();
	await releaseInstancePermission(instanceUrl);
}

async function releaseInstancePermission(instanceUrl: string): Promise<void> {
	try {
		await browser.permissions.remove({
			origins: permissionOriginPatterns(normalizeInstanceUrl(instanceUrl)),
		});
	} catch (error) {
		console.error('MyLinks could not release the instance permission', error);
	}
}
