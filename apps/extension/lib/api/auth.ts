import {
	apiTokenStorage,
	clearExtensionSession,
	instanceUrlStorage,
} from '@/lib/storage';

export class ExtensionAuthError extends Error {}

export function normalizeInstanceUrl(rawInstanceUrl: string): string {
	return new URL(rawInstanceUrl.trim()).origin;
}

function withWwwPrefix(origin: string): string | null {
	const url = new URL(origin);
	if (url.hostname.startsWith('www.')) {
		return null;
	}
	url.hostname = `www.${url.hostname}`;
	return url.origin;
}

/**
 * `redirect: 'error'` instead of the default `'follow'`: a cross-origin 30x
 * carries no CORS headers of its own, so the browser blocks it as a CORS
 * failure before it ever reaches the final response — following it is not an
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
 * typed origin first and falls back to its `www` sibling before giving up —
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

/**
 * Requests host permission for the instance origin, then hands the whole
 * auth handoff off to `launchWebAuthFlow`: it opens
 * `/extension/authorize?redirect_uri=...` on the instance (login there if
 * needed), and captures the final redirect once the server hands back a
 * token in the URL fragment. MyLinks is never an OAuth provider here — this
 * only reuses the browser API that OAuth flows also happen to use.
 */
export async function connectToInstance(rawInstanceUrl: string): Promise<void> {
	const instanceUrl = await resolveCanonicalOrigin(
		normalizeInstanceUrl(rawInstanceUrl)
	);

	const granted = await browser.permissions.request({
		origins: [`${instanceUrl}/*`],
	});
	if (!granted) {
		throw new ExtensionAuthError(
			'Permission was refused for this instance URL.'
		);
	}

	const redirectUri = browser.identity.getRedirectURL();
	const authorizeUrl = `${instanceUrl}/extension/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;

	const callbackUrl = await browser.identity.launchWebAuthFlow({
		url: authorizeUrl,
		interactive: true,
	});

	if (!callbackUrl) {
		throw new ExtensionAuthError('Authentication was cancelled.');
	}

	const token = extractTokenFromAuthCallback(callbackUrl);
	if (!token) {
		throw new ExtensionAuthError('The instance did not return a token.');
	}

	await instanceUrlStorage.setValue(instanceUrl);
	await apiTokenStorage.setValue(token);
}

export async function disconnectFromInstance(): Promise<void> {
	await clearExtensionSession();
}
