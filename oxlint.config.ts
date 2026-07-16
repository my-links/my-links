import { defineConfig } from 'oxlint';
import {
	ADONISJS_DEFAULT_IGNORE_PATTERNS,
	minimalstuffPreset,
} from '@minimalstuff/tooling/oxc/lint';

export default defineConfig({
	ignorePatterns: [
		...ADONISJS_DEFAULT_IGNORE_PATTERNS,
		'**/node_modules/**',
		'**/.adonisjs/**',
		'apps/webapp/bin/*',
		'apps/webapp/database/schema.ts',
	],
	extends: [minimalstuffPreset({ adonisjs: true, react: true })],
});
