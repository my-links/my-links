import KEYS from '#constants/keys';
import { useHotkeys } from 'react-hotkeys-hook';
import useGlobalHotkeys from '~/hooks/use_global_hotkeys';

export default function useShortcut(key: keyof typeof KEYS, cb: () => void) {
  const { globalHotkeysEnabled } = useGlobalHotkeys();
  return useHotkeys(KEYS[key], cb, {
    enabled: globalHotkeysEnabled,
    enableOnFormTags: ['INPUT'],
  });
}
