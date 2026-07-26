/**
 * Narrow port over "show the extension's panel beside the page".
 *
 * Chromium exposes `sidePanel`, Firefox `sidebarAction`, and the two disagree
 * on far more than their names. Chromium is told declaratively to open on a
 * toolbar click and has no way to focus a panel that is already showing;
 * Firefox needs a click listener of its own but can raise its sidebar
 * outright. Callers ask for the behaviour they want and stay out of that
 * argument — the same reason `bookmarks_api.ts` exists.
 */

export type PanelApi = {
	/** Makes clicking the extension's toolbar icon show the panel. */
	openOnToolbarIconClick(): void;
	/**
	 * Brings the panel in front of the user with keyboard focus in it.
	 *
	 * Returns nothing and is never awaited by design: both browsers only
	 * accept this inside a live user gesture, and awaiting anything first
	 * spends the gesture.
	 */
	reveal(windowId: number | undefined): void;
};

/** The slice of Chromium's `sidePanel` namespace this port uses. */
export type SidePanelNamespace = {
	setPanelBehavior(behavior: {
		openPanelOnActionClick: boolean;
	}): Promise<void>;
	open(options: { windowId: number }): Promise<void>;
	/** Chrome 141 and up only — older builds simply cannot close a panel. */
	close?: (options: { windowId: number }) => Promise<void>;
};

/** The slice of Firefox's `browser.sidebarAction` this port uses. */
export type SidebarActionNamespace = {
	open(): Promise<void>;
	toggle(): Promise<void>;
};

/** The slice of the toolbar button this port listens to (MV2 `browserAction`). */
export type ToolbarIconNamespace = {
	onClicked: { addListener(callback: () => void): void };
};

export function createSidePanelApi(sidePanel: SidePanelNamespace): PanelApi {
	return {
		openOnToolbarIconClick() {
			void sidePanel
				.setPanelBehavior({ openPanelOnActionClick: true })
				.catch(reportPanelFailure('set the side panel behavior'));
		},

		/**
		 * A panel that is already open is closed and reopened rather than left
		 * alone: Chrome has no API to focus the side panel, and `open` on a
		 * panel that is already showing is a silent no-op — so from a focused
		 * web page the shortcut would otherwise do nothing at all. Reopening is
		 * what moves keyboard focus, at the cost of remounting the panel.
		 */
		reveal(windowId) {
			if (windowId === undefined) {
				return;
			}

			void sidePanel
				.close?.({ windowId })
				.catch(reportPanelFailure('close the side panel'));

			void sidePanel
				.open({ windowId })
				.catch(reportPanelFailure('open the side panel'));
		},
	};
}

export function createSidebarActionApi(
	sidebarAction: SidebarActionNamespace,
	toolbarIcon: ToolbarIconNamespace
): PanelApi {
	return {
		/**
		 * Firefox has no equivalent of `openPanelOnActionClick`: a toolbar
		 * button with no popup just fires `onClicked`, and toggling from there
		 * is what makes the icon behave like Chromium's.
		 */
		openOnToolbarIconClick() {
			toolbarIcon.onClicked.addListener(() => {
				void sidebarAction
					.toggle()
					.catch(reportPanelFailure('toggle the sidebar'));
			});
		},

		/**
		 * Opens the sidebar but cannot focus it. Firefox never hands keyboard
		 * focus to an extension sidebar it opened programmatically, and offers
		 * no API to ask for it — open since 2018, still unfixed
		 * (https://bugzilla.mozilla.org/show_bug.cgi?id=1502713). Its own
		 * `_execute_sidebar_action` command has the same gap.
		 *
		 * Chromium's close-and-reopen workaround does not help here: the point
		 * of reopening is that a freshly created panel document takes focus,
		 * which is exactly what Firefox declines to do. So the caret is placed
		 * in the search field anyway — `document.activeElement` survives an
		 * unfocused document — and lands the moment the user clicks into the
		 * sidebar. The window is implicit: Firefox opens the sidebar of the
		 * window the gesture came from.
		 */
		reveal() {
			void sidebarAction.open().catch(reportPanelFailure('open the sidebar'));
		},
	};
}

/**
 * Stand-in for a browser that offers neither API. Every call is a loud no-op
 * rather than a throw: losing the panel should not take down the background
 * worker, which is also what keeps collections syncing and bookmarks
 * mirroring.
 */
export function createUnsupportedPanelApi(): PanelApi {
	const reportUnsupported = (): void => {
		console.error('This browser exposes no side panel or sidebar to open.');
	};

	return {
		openOnToolbarIconClick: reportUnsupported,
		reveal: reportUnsupported,
	};
}

export function getBrowserPanelApi(): PanelApi {
	if (browser.sidePanel) {
		return createSidePanelApi(browser.sidePanel);
	}

	const sidebarAction = readSidebarAction(browser);
	if (sidebarAction && browser.browserAction) {
		return createSidebarActionApi(sidebarAction, browser.browserAction);
	}

	return createUnsupportedPanelApi();
}

/**
 * `sidebarAction` is absent from the Chromium-generated types WXT ships, and a
 * namespace cannot be declared optional — on Chromium it genuinely is not
 * there. So it is read as unknown and validated here, like any other value
 * crossing into the extension from outside it.
 */
export function readSidebarAction(
	extensionApi: object
): SidebarActionNamespace | null {
	if (!('sidebarAction' in extensionApi)) {
		return null;
	}

	const candidate: unknown = extensionApi.sidebarAction;
	if (!isSidebarActionNamespace(candidate)) {
		return null;
	}

	return candidate;
}

function isSidebarActionNamespace(
	candidate: unknown
): candidate is SidebarActionNamespace {
	if (typeof candidate !== 'object' || candidate === null) {
		return false;
	}

	return (
		'open' in candidate &&
		typeof candidate.open === 'function' &&
		'toggle' in candidate &&
		typeof candidate.toggle === 'function'
	);
}

function reportPanelFailure(action: string): (error: unknown) => void {
	return (error: unknown) => {
		console.error(`Failed to ${action}`, error);
	};
}
