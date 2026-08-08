import { openSearch } from '@/lib/search/open_search';
import { syncBookmarks } from '@/lib/bookmarks/mirror';
import { collectionsCacheStorage } from '@/lib/storage';
import { createDebouncedTrigger } from '@/lib/debounce';
import { isRequestSyncMessage } from '@/lib/sync/messages';
import { getBrowserPanelApi } from '@/lib/panel/panel_api';
import { OPEN_SEARCH_COMMAND } from '@/lib/search/constants';
import { syncCollections } from '@/lib/sync/sync_collections';
import { BOOKMARK_SYNC_DEBOUNCE_MS } from '@/lib/bookmarks/constants';
import { SYNC_ALARM_NAME, SYNC_INTERVAL_MINUTES } from '@/lib/sync/constants';
import { createContextMenus, handleContextMenuClick } from '@/lib/context_menu';

export default defineBackground(() => {
	// Chromium's `sidePanel` and Firefox's `sidebarAction` disagree on both
	// naming and shape, so both live behind this port (see panel_api.ts).
	const panel = getBrowserPanelApi();
	panel.openOnToolbarIconClick();

	void createContextMenus();
	browser.contextMenus.onClicked.addListener((info, tab) => {
		void handleContextMenuClick(info, tab);
	});

	browser.commands.onCommand.addListener((command, tab) => {
		if (command !== OPEN_SEARCH_COMMAND) {
			return;
		}
		openSearch(panel, tab?.windowId);
	});

	void browser.alarms.create(SYNC_ALARM_NAME, {
		periodInMinutes: SYNC_INTERVAL_MINUTES,
	});

	browser.alarms.onAlarm.addListener((alarm) => {
		if (alarm.name === SYNC_ALARM_NAME) {
			void syncCollections();
			void syncBookmarks();
		}
	});

	// The mirror reads the cache, never the network, so a refreshed cache is
	// its "the server changed" signal. Requests landing while a pass is
	// already running are coalesced rather than dropped — see syncBookmarks.
	collectionsCacheStorage.watch(() => {
		void syncBookmarks();
	});

	const scheduleBookmarkSync = createDebouncedTrigger(() => {
		void syncBookmarks();
	}, BOOKMARK_SYNC_DEBOUNCE_MS);

	// `bookmarks` is an optional permission, so the namespace does not exist
	// until the user turns mirroring on. Registering again on `onAdded` is
	// what keeps native edits flowing within seconds of the grant instead of
	// waiting for the alarm — this worker is already running when the
	// permission lands, so its startup pass has come and gone.
	const registerBookmarkListeners = () => {
		if (!browser.bookmarks) {
			return;
		}
		if (browser.bookmarks.onCreated.hasListener(scheduleBookmarkSync)) {
			return;
		}
		browser.bookmarks.onCreated.addListener(scheduleBookmarkSync);
		browser.bookmarks.onChanged.addListener(scheduleBookmarkSync);
		browser.bookmarks.onRemoved.addListener(scheduleBookmarkSync);
		browser.bookmarks.onMoved.addListener(scheduleBookmarkSync);
	};

	registerBookmarkListeners();
	browser.permissions.onAdded.addListener(() => {
		registerBookmarkListeners();
		void syncBookmarks();
	});

	// MV3 has no persistent thread, so "never paused" means resyncing on
	// every plausible wake signal instead of relying solely on the alarm:
	// switching tabs, regaining window focus, or a sidebar asking directly.
	browser.tabs.onActivated.addListener(() => {
		void syncCollections();
		void syncBookmarks();
	});

	browser.windows.onFocusChanged.addListener((windowId) => {
		if (windowId !== browser.windows.WINDOW_ID_NONE) {
			void syncCollections();
			void syncBookmarks();
		}
	});

	browser.runtime.onMessage.addListener((message: unknown) => {
		if (isRequestSyncMessage(message)) {
			void syncCollections();
			void syncBookmarks();
		}
	});

	// This callback itself reruns on every service worker wake (install,
	// browser start, any of the listeners above) — resync immediately rather
	// than waiting for the next alarm tick. Firefox runs a persistent MV2
	// background page instead, so there it simply runs once and stays up; the
	// wake triggers above are harmless extra resyncs, not the lifeline.
	void syncCollections();
	void syncBookmarks();
});
