import KEYS from '#constants/keys';
import { useHotkeys } from 'react-hotkeys-hook';
import { useGlobalHotkeysStore } from '~/store/global_hotkeys_store';

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
	return useHotkeys(
		KEYS[key],
		(event) => {
			event.preventDefault();
			cb();
		},
		{
			enabled: disableGlobalCheck ? enabled : enabled && globalHotkeysEnabled,
			enableOnFormTags: ['INPUT'],
		}
	);
}
