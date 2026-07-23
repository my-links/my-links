import {
	apiTokenStorage,
	clearExtensionSession,
	instanceUrlStorage,
} from '@/lib/storage';

export class ExtensionAuthError extends Error {}

export function normalizeInstanceUrl(rawInstanceUrl: string): string {
	return new URL(rawInstanceUrl.trim()).origin;
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
	const instanceUrl = normalizeInstanceUrl(rawInstanceUrl);

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
