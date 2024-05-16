import KEYS from '#constants/keys';
import { router } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { ReactNode } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useGlobalHotkeys from '~/hooks/use_global_hotkeys';
import useSearchParam from '~/hooks/use_search_param';
import { appendCollectionId } from '~/lib/navigation';

export default function BackToDashboard({ children }: { children: ReactNode }) {
  const collectionId = useSearchParam('collectionId');
  const { globalHotkeysEnabled } = useGlobalHotkeys();
  useHotkeys(
    KEYS.ESCAPE_KEY,
    () => {
      router.visit(appendCollectionId(route('dashboard').url, collectionId));
    },
    { enabled: globalHotkeysEnabled, enableOnFormTags: ['INPUT'] }
  );
  return <>{children}</>;
}
