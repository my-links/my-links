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
		}),
		presetWebFonts({
			provider: 'bunny',
		}),
	],
});
