import vine from '@vinejs/vine';

export const authorizeExtensionValidator = vine.create(
	vine.object({
		// snake_case to match the OAuth-style `redirect_uri` convention used by
		// `chrome.identity.getRedirectURL()` on the extension side.
		redirect_uri: vine.string().trim().minLength(1),
	})
);
