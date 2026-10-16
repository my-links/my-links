export const EXTENSION_BROWSER = {
	CHROMIUM: 'chromium',
	FIREFOX: 'firefox',
} as const;

export type ExtensionBrowser =
	(typeof EXTENSION_BROWSER)[keyof typeof EXTENSION_BROWSER];

export const OFFICIAL_CHROMIUM_EXTENSION_ID =
	'agkmlplihacolkakgeccnbhphnepphma';
export const OFFICIAL_FIREFOX_ADDON_ID = 'my-links@mylinks.app';

export const CHROMIUM_CALLBACK_HOST_SUFFIX = '.chromiumapp.org';
export const FIREFOX_CALLBACK_HOST_SUFFIX = '.extensions.allizom.org';
