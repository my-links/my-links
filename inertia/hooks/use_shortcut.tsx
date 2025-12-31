import { useEffect } from 'react';
import KEYS from '#constants/keys';
import { useGlobalHotkeysStore } from '~/stores/global_hotkeys_store';

type ShortcutOptions = {
	enabled?: boolean;
	disableGlobalCheck?: boolean;
};

export default function useShortcut(
	key: keyof typeof KEYS,
	cb: () => void,
	{ enabled, disableGlobalCheck }: ShortcutOptions = {
		enabled: true,
		disableGlobalCheck: false,
	}
) {
	const { globalHotkeysEnabled } = useGlobalHotkeysStore();
	const isEnabled = disableGlobalCheck
		? enabled
		: enabled && globalHotkeysEnabled;

	useEffect(() => {
		if (!isEnabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			const keyCombo = KEYS[key];
			const keys = keyCombo.split('+').map((k) => k.trim().toLowerCase());

			const ctrlPressed = keys.includes('ctrl') && event.ctrlKey;
			const altPressed = keys.includes('alt') && event.altKey;
			const shiftPressed = keys.includes('shift') && event.shiftKey;
			const metaPressed = keys.includes('meta') && event.metaKey;

			const mainKey = keys.find(
				(k) => !['ctrl', 'alt', 'shift', 'meta'].includes(k)
			);

			const mainKeyMatch =
				mainKey && event.key.toLowerCase() === mainKey.toLowerCase();

			const modifiersMatch =
				(keys.includes('ctrl') ? ctrlPressed : !event.ctrlKey) &&
				(keys.includes('alt') ? altPressed : !event.altKey) &&
				(keys.includes('shift') ? shiftPressed : !event.shiftKey) &&
				(keys.includes('meta') ? metaPressed : !event.metaKey);

			if (mainKeyMatch && modifiersMatch) {
				event.preventDefault();
				cb();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [key, cb, isEnabled]);
}
