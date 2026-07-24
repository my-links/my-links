import { defineConfig } from 'wxt';
import { fileURLToPath } from 'node:url';

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ['@wxt-dev/module-react', '@wxt-dev/unocss'],
	unocss: {
		configOrPath: fileURLToPath(
			new URL('../../uno.config.ts', import.meta.url)
		),
	},
	manifest: {
		// `sidePanel` is added automatically by WXT because of the
		// `sidepanel` entrypoint. Self-hosted instances are arbitrary,
		// user-supplied origins, so their host permission is requested at
		// runtime (`browser.permissions.request`) instead of being listed
		// here as a fixed `host_permissions` entry.
		// `contextMenus`/`notifications` back the quick-capture flow (Phase 2).
		// `tabs` gives the sidebar's quick-add button reliable title/url
		// access to whatever tab is currently active — the side panel stays
		// open across tab switches, so the gesture-scoped `activeTab`
		// permission would go stale the moment the user changes tabs without
		// reclicking the toolbar icon.
		permissions: [
			'storage',
			'identity',
			'alarms',
			'contextMenus',
			'notifications',
			'tabs',
		],
		// Optional, not static: mirroring rearranges the user's bookmarks bar,
		// so the grant is asked for from the options page at the moment they
		// turn the mirror on — never at install time.
		optional_permissions: ['bookmarks'],
		optional_host_permissions: ['*://*/*'],
		// Empty object: the extension has an action (icon), but no popup —
		// clicking it opens the side panel instead (see background.ts).
		action: {},
	},
});
