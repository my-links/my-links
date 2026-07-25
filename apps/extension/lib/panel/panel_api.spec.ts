import { describe, expect, it, vi } from 'vitest';

import {
	createSidePanelApi,
	createSidebarActionApi,
	createUnsupportedPanelApi,
	readSidebarAction,
	type SidePanelNamespace,
	type SidebarActionNamespace,
	type ToolbarIconNamespace,
} from '@/lib/panel/panel_api';

const WINDOW_ID = 7;

function buildSidePanel(calls: string[]): SidePanelNamespace {
	return {
		setPanelBehavior: async (behavior) => {
			calls.push(`setPanelBehavior:${String(behavior.openPanelOnActionClick)}`);
		},
		open: async ({ windowId }) => {
			calls.push(`open:${String(windowId)}`);
		},
		close: async ({ windowId }) => {
			calls.push(`close:${String(windowId)}`);
		},
	};
}

function buildSidebarAction(calls: string[]): SidebarActionNamespace {
	return {
		open: async () => {
			calls.push('open');
		},
		toggle: async () => {
			calls.push('toggle');
		},
	};
}

function buildToolbarIcon(): ToolbarIconNamespace & { click(): void } {
	const listeners: Array<() => void> = [];

	return {
		onClicked: {
			addListener: (callback) => {
				listeners.push(callback);
			},
		},
		click: () => {
			for (const listener of listeners) {
				listener();
			}
		},
	};
}

describe('createSidePanelApi', () => {
	it('should ask Chromium to open the panel when the toolbar icon is clicked', () => {
		const calls: string[] = [];

		createSidePanelApi(buildSidePanel(calls)).openOnToolbarIconClick();

		expect(calls).toEqual(['setPanelBehavior:true']);
	});

	it('should close before reopening, because Chromium cannot focus a shown panel', () => {
		const calls: string[] = [];

		createSidePanelApi(buildSidePanel(calls)).reveal(WINDOW_ID);

		expect(calls).toEqual([
			`close:${String(WINDOW_ID)}`,
			`open:${String(WINDOW_ID)}`,
		]);
	});

	it('should still open on a Chromium build too old to expose close', () => {
		const calls: string[] = [];
		const { close: _unsupported, ...sidePanel } = buildSidePanel(calls);

		createSidePanelApi(sidePanel).reveal(WINDOW_ID);

		expect(calls).toEqual([`open:${String(WINDOW_ID)}`]);
	});

	it('should not open a panel when no window is known to open it in', () => {
		const calls: string[] = [];

		createSidePanelApi(buildSidePanel(calls)).reveal(undefined);

		expect(calls).toEqual([]);
	});
});

describe('createSidebarActionApi', () => {
	it('should toggle the sidebar when the toolbar icon is clicked', () => {
		const calls: string[] = [];
		const toolbarIcon = buildToolbarIcon();

		createSidebarActionApi(
			buildSidebarAction(calls),
			toolbarIcon
		).openOnToolbarIconClick();
		expect(calls).toEqual([]);

		toolbarIcon.click();

		expect(calls).toEqual(['toggle']);
	});

	it('should open the sidebar without closing it first', () => {
		const calls: string[] = [];

		createSidebarActionApi(
			buildSidebarAction(calls),
			buildToolbarIcon()
		).reveal(WINDOW_ID);

		expect(calls).toEqual(['open']);
	});
});

describe('createUnsupportedPanelApi', () => {
	it('should report the missing panel instead of throwing', () => {
		const reportError = vi.spyOn(console, 'error').mockImplementation(() => {});

		const panel = createUnsupportedPanelApi();
		panel.openOnToolbarIconClick();
		panel.reveal(WINDOW_ID);

		expect(reportError).toHaveBeenCalledTimes(2);
		reportError.mockRestore();
	});
});

describe('readSidebarAction', () => {
	it('should find the sidebar on a browser that exposes it', () => {
		const sidebarAction = buildSidebarAction([]);

		expect(readSidebarAction({ sidebarAction })).toBe(sidebarAction);
	});

	it('should find nothing on a browser without the namespace', () => {
		expect(readSidebarAction({ sidePanel: {} })).toBeNull();
	});

	it('should reject a namespace missing the methods this port calls', () => {
		expect(readSidebarAction({ sidebarAction: { open: () => {} } })).toBeNull();
	});
});
