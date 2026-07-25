import { requestSearchFocus } from './focus_request';

/**
 * Answers the keyboard shortcut: raise the side panel and tell whichever
 * MyLinks page ends up in front to put the caret in its search field.
 *
 * A panel that is already open is closed and reopened rather than left
 * alone. Chrome has no API to focus the side panel, and `open` on a panel
 * that is already showing is a silent no-op — so from a focused web page the
 * shortcut would otherwise do nothing at all. Reopening is what moves
 * keyboard focus, at the cost of remounting the panel.
 *
 * Nothing is awaited between the calls: Chrome only accepts `open` inside a
 * live user gesture, and awaiting anything spends it. The flag write still
 * lands long before the panel's React tree mounts and reads it.
 *
 * Firefox has no `sidePanel` API (it uses `sidebar_action`), so there this
 * only focuses a sidebar the user already has open — same parity gap as the
 * rest of the panel handling in `background.ts`.
 */
export function openSearch(windowId: number | undefined): void {
	void requestSearchFocus();

	if (windowId === undefined) {
		return;
	}

	closeSidePanel(windowId);

	void browser.sidePanel?.open({ windowId }).catch((error: unknown) => {
		console.error('Failed to open the side panel', error);
	});
}

/**
 * No-op when the panel is already closed, and on browsers older than Chrome
 * 141, where `close` does not exist yet — those keep the previous behaviour
 * of only reacting when the panel is shut.
 */
function closeSidePanel(windowId: number): void {
	if (!browser.sidePanel?.close) {
		return;
	}

	void browser.sidePanel.close({ windowId }).catch((error: unknown) => {
		console.error('Failed to close the side panel', error);
	});
}
