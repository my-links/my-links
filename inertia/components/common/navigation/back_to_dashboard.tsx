import { router } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { PropsWithChildren } from 'react';
import useSearchParam from '~/hooks/use_search_param';
import useShortcut from '~/hooks/use_shortcut';
import { appendCollectionId } from '~/lib/navigation';

interface BackToDashboardProps extends PropsWithChildren {
	disabled?: boolean;
}

export default function BackToDashboard({
	disabled = false,
	children,
}: BackToDashboardProps) {
	const collectionId = Number(useSearchParam('collectionId'));
	useShortcut(
		'ESCAPE_KEY',
		() =>
			router.visit(appendCollectionId(route('dashboard').url, collectionId)),
		{ disableGlobalCheck: true, enabled: !disabled }
	);
	return <>{children}</>;
}
