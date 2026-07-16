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
});
