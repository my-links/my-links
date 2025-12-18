import { configApp } from '@adonisjs/eslint-config';
import pluginLingui from 'eslint-plugin-lingui';

export default configApp({
	files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
	plugins: {
		lingui: pluginLingui,
	},
	rules: {
		'unicorn/filename-case': 'off',
		'lingui/t-call-in-function': 'error',
	},
});
