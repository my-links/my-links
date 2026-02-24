import presetIcons from '@unocss/preset-icons';
import presetWebFonts from '@unocss/preset-web-fonts';
import { defineConfig, presetWind4 } from 'unocss';

export default defineConfig({
	presets: [
		presetWind4({
			dark: 'class',
		}),
		presetIcons({
			cdn: 'https://esm.sh/',
		}) as any,
		presetWebFonts({
			provider: 'bunny',
		}) as any,
	],
	safelist: [
		'bg-yellow-100',
		'text-yellow-800',
		'dark:bg-yellow-900',
		'dark:text-yellow-200',
		'bg-green-100',
		'text-green-800',
		'dark:bg-green-900',
		'dark:text-green-200',
		'bg-red-100',
		'text-red-800',
		'dark:bg-red-900',
		'dark:text-red-200',
		'bg-purple-100',
		'text-purple-800',
		'dark:bg-purple-900',
		'dark:text-purple-200',
		'scrollbar-gutter-stable',
	],
	rules: [
		[
			'scrollbar-gutter-stable',
			{
				'scrollbar-gutter': 'stable',
			},
		],
	],
});
