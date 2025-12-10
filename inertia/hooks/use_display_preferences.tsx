import { getDisplayPreferences } from '#shared/lib/display_preferences';
import { DisplayPreferences } from '#shared/types/index';
import { router } from '@inertiajs/react';
import { useAuth } from '~/hooks/use_auth';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';

export const useDisplayPreferences = () => {
	const { user } = useAuth();
	const displayPreferences = getDisplayPreferences(user?.displayPreferences);
	const tuyau = useTuyauRequired();

	const handleUpdateDisplayPreferences = (
		displayPreferences: Partial<DisplayPreferences>
	) => {
		const routeInfo = tuyau.$route('user.update-display-preferences');
		if (!routeInfo) {
			throw new Error('Route user.update-display-preferences not found');
		}
		router.visit(routeInfo.path, {
			method: 'post',
			data: {
				displayPreferences,
			},
		});
	};

	return {
		displayPreferences,
		handleUpdateDisplayPreferences,
	};
};
