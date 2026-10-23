import { minimalstuffPreset } from '@minimalstuff/tooling/oxc/lint';

export default minimalstuffPreset({
	adonisjs: true,
	react: true,
	rules: {
		// autoFocus on our own Input component is intentional, only raw DOM elements are flagged
		'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
		// labels come from {children} and <Trans> nested deeper than the default depth
		'jsx-a11y/control-has-associated-label': ['error', { depth: 5 }],
	},
	overrides: [
		{
			// emitDecoratorMetadata needs value imports for injected constructor parameters
			files: ['apps/webapp/app/**', 'apps/webapp/commands/**'],
			rules: { 'typescript/consistent-type-imports': 'off' },
		},
	],
});
