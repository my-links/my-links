import { configApp } from '@adonisjs/eslint-config';
import pluginLingui from 'eslint-plugin-lingui';

export default configApp({
	files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
	ignores: ['.adonisjs/**/*', 'database/schema.ts'],
	plugins: {
		lingui: pluginLingui,
	},
	rules: {
		'unicorn/filename-case': 'off',
		'lingui/t-call-in-function': 'error',
	},
});
