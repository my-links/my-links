import { createHash } from 'node:crypto';

import { InvalidExtensionIdsConfigException } from '#exceptions/extension/invalid_extension_ids_config_exception';
import {
	EXTENSION_BROWSER,
	OFFICIAL_CHROMIUM_EXTENSION_ID,
	OFFICIAL_FIREFOX_ADDON_ID,
	CHROMIUM_CALLBACK_HOST_SUFFIX,
	FIREFOX_CALLBACK_HOST_SUFFIX,
	type ExtensionBrowser,
} from '#constants/extension';

const CHROMIUM_EXTENSION_ID_PATTERN = /^[a-p]{32}$/;
const FIREFOX_ADDON_ID_PATTERN = /^(?:[\w.-]+@[\w.-]+|\{[0-9a-fA-F-]{36}\})$/;
const EXTENSION_IDS_SEPARATOR = ',';

export type AllowedExtensionHosts = ReadonlyMap<string, ExtensionBrowser>;

/** Firefox derives the callback subdomain from the SHA-1 of the add-on id. */
export function hashFirefoxAddonId(addonId: string): string {
	return createHash('sha1').update(addonId).digest('hex');
}

/**
 * Parses the `EXTENSION_IDS` env value. Doubles as an `Env.schema` validator:
 * a malformed entry stops the boot instead of silently trusting nothing.
 */
export function parseExtensionIds(
	_key: string,
	rawValue?: string
): readonly string[] {
	if (!rawValue) return [];

	const extensionIds = rawValue
		.split(EXTENSION_IDS_SEPARATOR)
		.map((extensionId) => extensionId.trim())
		.filter((extensionId) => extensionId.length > 0);

	for (const extensionId of extensionIds) {
		if (!resolveExtensionBrowserOfId(extensionId)) {
			throw new InvalidExtensionIdsConfigException(extensionId);
		}
	}

	return extensionIds;
}

function resolveExtensionBrowserOfId(
	extensionId: string
): ExtensionBrowser | null {
	if (CHROMIUM_EXTENSION_ID_PATTERN.test(extensionId)) {
		return EXTENSION_BROWSER.CHROMIUM;
	}
	if (FIREFOX_ADDON_ID_PATTERN.test(extensionId)) {
		return EXTENSION_BROWSER.FIREFOX;
	}
	return null;
}

function toCallbackHost(extensionId: string): [string, ExtensionBrowser] {
	if (resolveExtensionBrowserOfId(extensionId) === EXTENSION_BROWSER.CHROMIUM) {
		return [
			`${extensionId}${CHROMIUM_CALLBACK_HOST_SUFFIX}`,
			EXTENSION_BROWSER.CHROMIUM,
		];
	}
	return [
		`${hashFirefoxAddonId(extensionId)}${FIREFOX_CALLBACK_HOST_SUFFIX}`,
		EXTENSION_BROWSER.FIREFOX,
	];
}

export function resolveAllowedExtensionHosts(
	additionalExtensionIds: readonly string[] = []
): AllowedExtensionHosts {
	const extensionIds = [
		OFFICIAL_CHROMIUM_EXTENSION_ID,
		OFFICIAL_FIREFOX_ADDON_ID,
		...additionalExtensionIds,
	];

	return new Map(extensionIds.map(toCallbackHost));
}
