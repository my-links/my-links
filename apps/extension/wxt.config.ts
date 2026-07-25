import { defineConfig } from 'wxt';
import { fileURLToPath } from 'node:url';

import { OPEN_SEARCH_COMMAND } from './lib/search/constants';

/**
 * Self-hosted instances are arbitrary, user-supplied origins, so their host
 * permission is asked for at runtime (`browser.permissions.request`) instead
 * of being pinned here.
 */
const ANY_ORIGIN = '*://*/*';

/**
 * Stable add-on id. Firefox only recommends one for MV2, but the auth handoff
 * makes it mandatory in practice: `identity.getRedirectURL()` returns a
 * subdomain hashed from this id, so without it every temporary install would
 * hand the instance a different callback URL.
 */
const GECKO_EXTENSION_ID = 'mylinks@mylinks.app';

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ['@wxt-dev/module-react', '@wxt-dev/unocss'],
	unocss: {
		configOrPath: fileURLToPath(
			new URL('../../uno.config.ts', import.meta.url)
		),
	},
	manifest: ({ browser, manifestVersion }) => ({
		// `sidePanel` is added automatically by WXT because of the `sidepanel`
		// entrypoint (which becomes `sidebar_action` on Firefox).
		// `contextMenus`/`notifications` back the quick-capture flow (Phase 2).
		// `tabs` gives the sidebar's quick-add button reliable title/url
		// access to whatever tab is currently active — the panel stays open
		// across tab switches, so the gesture-scoped `activeTab` permission
		// would go stale the moment the user changes tabs without reclicking
		// the toolbar icon.
		permissions: [
			'storage',
			'identity',
			'alarms',
			'contextMenus',
			'notifications',
			'tabs',
		],
		// `bookmarks` is optional, not static: mirroring adds nodes to the
		// user's bookmarks bar, so the grant is asked for from the options page
		// at the moment they turn the mirror on — never at install time.
		//
		// MV2 has no `optional_host_permissions` (WXT strips the key), and
		// carries optional origins in `optional_permissions` instead. Getting
		// this wrong costs the whole self-hosted story: without it the runtime
		// origin request is refused outright and the instance can never be
		// connected.
		optional_permissions:
			manifestVersion === 3 ? ['bookmarks'] : ['bookmarks', ANY_ORIGIN],
		optional_host_permissions: [ANY_ORIGIN],
		// Empty object: the extension has an action (icon), but no popup —
		// clicking it opens the panel instead (see background.ts). WXT renames
		// this to `browser_action` on MV2.
		action: {},
		commands: {
			[OPEN_SEARCH_COMMAND]: {
				// Ctrl+Shift+K is free in Chromium but belongs to Firefox's Web
				// Console, and a shortcut the browser already owns is accepted
				// into the manifest and then never fires. Firefox gets its own
				// suggestion; either way the user can rebind it.
				suggested_key:
					browser === 'firefox'
						? { default: 'Alt+Shift+K' }
						: { default: 'Ctrl+Shift+K', mac: 'Command+Shift+K' },
				description: 'Open MyLinks and focus the search field',
			},
		},
		...(browser === 'firefox' && {
			browser_specific_settings: {
				gecko: {
					id: GECKO_EXTENSION_ID,
					// Links, titles and folder structure leave the device for
					// the user's own instance, which is exactly what
					// `bookmarksInfo` covers. Declaring `none` here would be a
					// lie — the extension does transmit them, just not to us.
					data_collection_permissions: { required: ['bookmarksInfo'] },
				},
			},
		}),
	}),
});
