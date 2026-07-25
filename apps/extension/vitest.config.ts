import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

/**
 * Which browser the suite pretends to build for. WXT derives
 * `import.meta.env.BROWSER`/`MANIFEST_VERSION` from it, so running the suite
 * twice is what keeps the Firefox target honest — `pnpm test:firefox` builds
 * the same specs as MV2.
 */
const targetBrowser = process.env.WXT_TEST_BROWSER ?? 'chrome';

export default defineConfig({
	plugins: [WxtVitest({ browser: targetBrowser })],
});
