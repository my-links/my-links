import KEYS from '#constants/keys';
import { useHotkeys } from 'react-hotkeys-hook';
import useGlobalHotkeys from '~/hooks/use_global_hotkeys';

type ShortcutOptions = {
  enabled?: boolean;
};

export default function useShortcut(
  key: keyof typeof KEYS,
  cb: () => void,
  { enabled }: ShortcutOptions = {
    enabled: true,
  }
) {
  const { globalHotkeysEnabled } = useGlobalHotkeys();
  return useHotkeys(
    KEYS[key],
    (event) => {
      event.preventDefault();
      cb();
    },
    {
      enabled: key === 'ESCAPE_KEY' ? true : enabled && globalHotkeysEnabled,
      enableOnFormTags: ['INPUT'],
    }
  );
}
