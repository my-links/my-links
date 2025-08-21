import { getDisplayPreferences } from '#shared/lib/display_preferences';
import { DisplayPreferences } from '#shared/types/index';
import { router } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useAuth } from '~/hooks/use_auth';

export const useDisplayPreferences = () => {
	const { user } = useAuth();
	const displayPreferences = getDisplayPreferences(user?.displayPreferences);

	const handleUpdateDisplayPreferences = (
		displayPreferences: Partial<DisplayPreferences>
	) => {
		router.visit(route('user.update-display-preferences').path, {
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
