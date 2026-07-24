import { syncBookmarks } from '@/lib/bookmarks/mirror';
import { collectionsCacheStorage } from '@/lib/storage';
import { createDebouncedTrigger } from '@/lib/debounce';
import { isRequestSyncMessage } from '@/lib/sync/messages';
import { syncCollections } from '@/lib/sync/sync_collections';
import { BOOKMARK_SYNC_DEBOUNCE_MS } from '@/lib/bookmarks/constants';
import { SYNC_ALARM_NAME, SYNC_INTERVAL_MINUTES } from '@/lib/sync/constants';
import { createContextMenus, handleContextMenuClick } from '@/lib/context_menu';

export default defineBackground(() => {
	// Firefox has no `sidePanel` API yet (it uses `sidebar_action` instead) —
	// this is a no-op there until Firefox parity lands.
	browser.sidePanel
		?.setPanelBehavior({ openPanelOnActionClick: true })
		.catch((error: unknown) => {
			console.error('Failed to set side panel behavior', error);
		});

	void createContextMenus();
	browser.contextMenus.onClicked.addListener((info, tab) => {
		void handleContextMenuClick(info, tab);
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
		}
	});

	// This callback itself reruns on every service worker wake (install,
	// browser start, any of the listeners above) — resync immediately rather
	// than waiting for the next alarm tick.
	void syncCollections();
	void syncBookmarks();
});
