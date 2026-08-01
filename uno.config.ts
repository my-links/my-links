import presetIcons from '@unocss/preset-icons';
import { defineConfig, presetWind4 } from 'unocss';
import presetWebFonts from '@unocss/preset-web-fonts';
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local';

export default defineConfig({
	presets: [
		presetWind4({
			dark: 'class',
		}),
		presetIcons(),
		presetWebFonts({
			provider: 'bunny',
			processors: createLocalFontProcessor(),
			fonts: {
				display: { name: 'Bricolage Grotesque', weights: [500, 600, 700, 800] },
				sans: { name: 'Instrument Sans', weights: [400, 500, 600, 700] },
				mono: { name: 'JetBrains Mono', weights: [400, 500, 600] },
			},
		}),
	],
	theme: {
		colors: {
			// Brand palette, from docs/public/logo-light.svg. Dark variants keep the
			// same cold, undecorated character rather than warming the neutrals up.
			brand: { DEFAULT: '#005AA5', dark: '#2B84D1' },
			lift: { DEFAULT: '#48A2FF', dark: '#48A2FF' },
			ink: { DEFAULT: '#0B1220', dark: '#F7F8FA' },
			paper: { DEFAULT: '#F7F8FA', dark: '#0B1220' },
			rule: { DEFAULT: '#DCE1E8', dark: '#1E2733' },
		},
	},
	content: {
		pipeline: {
			include: [
				/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
				'src/**/*.{ts,tsx}',
			],
		},
	},
	rules: [
		[
			'scrollbar-gutter-stable',
			{
				'scrollbar-gutter': 'stable',
			},
		],
	],
});
