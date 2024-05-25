import { router } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { ReactNode } from 'react';
import useSearchParam from '~/hooks/use_search_param';
import useShortcut from '~/hooks/use_shortcut';
import { appendCollectionId } from '~/lib/navigation';

export default function BackToDashboard({ children }: { children: ReactNode }) {
  const collectionId = Number(useSearchParam('collectionId'));
  useShortcut(
    'ESCAPE_KEY',
    () =>
      router.visit(appendCollectionId(route('dashboard').url, collectionId)),
    { disableGlobalCheck: true }
  );
  return <>{children}</>;
}
