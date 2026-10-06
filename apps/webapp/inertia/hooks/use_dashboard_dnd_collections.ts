import { useContext } from 'react';

import {
	DashboardDndContext,
	type DashboardDndContextValue,
} from '~/components/dashboard/dnd/dashboard_dnd_context';

export function useDashboardDndCollections(): DashboardDndContextValue {
	const context = useContext(DashboardDndContext);
	if (!context) {
		throw new Error(
			'useDashboardDndCollections must be used within DashboardDndProvider'
		);
	}
	return context;
}
