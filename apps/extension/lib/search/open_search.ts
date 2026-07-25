import { requestSearchFocus } from './focus_request';
import type { PanelApi } from '@/lib/panel/panel_api';

/**
 * Answers the keyboard shortcut: raise the panel and tell whichever MyLinks
 * page ends up in front to put the caret in its search field.
 *
 * The flag is written first and never awaited: both browsers only accept the
 * raise inside a live user gesture, and awaiting anything spends it, while the
 * write still lands long before the panel's React tree mounts and reads it.
 * How a panel is actually raised differs per browser and lives behind
 * `PanelApi`.
 */
export function openSearch(
	panel: PanelApi,
	windowId: number | undefined
): void {
	void requestSearchFocus();

	panel.reveal(windowId);
}
