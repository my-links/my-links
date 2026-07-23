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
		permissions: ['storage', 'identity'],
		optional_host_permissions: ['*://*/*'],
		// Empty object: the extension has an action (icon), but no popup —
		// clicking it opens the side panel instead (see background.ts).
		action: {},
	},
});
