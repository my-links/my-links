import { KEYS } from '~/consts/keys';

const NAMED_KEYS: Record<string, string> = {
	alt: 'Alt',
	arrowdown: '↓',
	arrowup: '↑',
	ctrl: 'Ctrl',
	enter: '↵',
	escape: 'Esc',
	meta: 'Meta',
	shift: 'Shift',
};

/**
 * Splits a `KEYS` combo into the tokens a `Kbd` renders, so the modal shows
 * what `use_shortcut.ts` actually listens for: `ctrl+k` becomes
 * `['Ctrl', 'K']`.
 */
export function formatShortcut(key: keyof typeof KEYS): string[] {
	return KEYS[key]
		.split('+')
		.map((token) => token.trim())
		.map((token) => NAMED_KEYS[token.toLowerCase()] ?? token.toUpperCase());
}
