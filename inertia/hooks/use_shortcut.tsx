import KEYS from '#constants/keys';
import { useHotkeys } from 'react-hotkeys-hook';
import useGlobalHotkeys from '~/hooks/use_global_hotkeys';

type ShortcutOptions = { ignoreGlobalHotkeysStatus?: boolean };

export default function useShortcut(
  key: keyof typeof KEYS,
  cb: () => void,
  options: ShortcutOptions = {
    ignoreGlobalHotkeysStatus: false,
  }
) {
  const { globalHotkeysEnabled } = useGlobalHotkeys();
  return useHotkeys(KEYS[key], cb, {
    enabled: !options.ignoreGlobalHotkeysStatus ? globalHotkeysEnabled : true,
    enableOnFormTags: ['INPUT'],
  });
}
