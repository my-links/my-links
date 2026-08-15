import { useIsMobile } from '~/hooks/use_is_mobile';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';

export type SidebarMode = 'hidden' | 'rail' | 'expanded';

/**
 * What collapsing the sidebar means depends on the viewport: on desktop it
 * shrinks to a rail of icons that stay clickable, on mobile it gets out of the
 * way entirely. The stored `sidebarOpen` flag drives both.
 */
export function useSidebarMode(): SidebarMode {
	const isMobile = useIsMobile();
	const sidebarOpen = useDashboardLayoutStore((state) => state.sidebarOpen);

	if (sidebarOpen) return 'expanded';

	return isMobile ? 'hidden' : 'rail';
}
