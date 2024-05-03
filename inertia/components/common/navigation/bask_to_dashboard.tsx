import KEYS from '#constants/keys';
import PATHS from '#constants/paths';
import { router } from '@inertiajs/react';
import { ReactNode } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useGlobalHotkeys from '~/hooks/use_global_hotkeys';

export default function BackToDashboard({ children }: { children: ReactNode }) {
  const { globalHotkeysEnabled } = useGlobalHotkeys();
  useHotkeys(
    KEYS.ESCAPE_KEY,
    () => {
      router.visit(PATHS.DASHBOARD);
    },
    { enabled: globalHotkeysEnabled, enableOnFormTags: ['INPUT'] }
  );
  return <>{children}</>;
}
