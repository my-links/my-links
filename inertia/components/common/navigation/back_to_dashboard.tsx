import { router } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import useSearchParam from '~/hooks/use_search_param';
import useShortcut from '~/hooks/use_shortcut';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { appendCollectionId } from '~/lib/navigation';

interface BackToDashboardProps extends PropsWithChildren {
	disabled?: boolean;
}

export default function BackToDashboard({
	disabled = false,
	children,
}: BackToDashboardProps) {
	const collectionId = Number(useSearchParam('collectionId'));
	const tuyau = useTuyauRequired();

	useShortcut(
		'ESCAPE_KEY',
		() =>
			router.visit(
				appendCollectionId(tuyau.$route('dashboard').path, collectionId)
			),
		{ disableGlobalCheck: true, enabled: !disabled }
	);
	return <>{children}</>;
}
