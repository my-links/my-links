import KEYS from '#constants/keys';
import { useHotkeys } from '@mantine/hooks';
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
	return useHotkeys(
		[[KEYS[key], () => isEnabled && cb(), { preventDefault: true }]],
		undefined,
		true
	);
}
