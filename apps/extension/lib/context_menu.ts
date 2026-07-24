import { createLink } from '@/lib/api/links';
import { findLinkByUrl } from '@/lib/collections_tree';
import { collectionsCacheStorage } from '@/lib/storage';
import { syncCollections } from '@/lib/sync/sync_collections';

const ADD_PAGE_MENU_ID = 'mylinks-add-page';
const ADD_LINK_MENU_ID = 'mylinks-add-link';
const ADD_SELECTION_MENU_ID = 'mylinks-add-selection';

/** Registers the right-click "Add to MyLinks" entries. Idempotent: safe to
 * call on every service-worker wake (install, browser start, update). */
export async function createContextMenus(): Promise<void> {
	await browser.contextMenus.removeAll();

	browser.contextMenus.create({
		id: ADD_PAGE_MENU_ID,
		title: 'Add page to MyLinks',
		contexts: ['page'],
	});
	browser.contextMenus.create({
		id: ADD_LINK_MENU_ID,
		title: 'Add link to MyLinks',
		contexts: ['link'],
	});
	browser.contextMenus.create({
		id: ADD_SELECTION_MENU_ID,
		title: 'Add selection to MyLinks',
		contexts: ['selection'],
	});
}

interface QuickCapture {
	name: string;
	url: string;
	description?: string | null;
}

/**
 * Chrome's `contextMenus.OnClickData` has no `linkText` field (that's a
 * Firefox-only extra), so a link capture is named after its URL — the user
 * can rename it from the edit modal afterwards, same as any other quick-add.
 */
export function resolveQuickCapture(
	info: Browser.contextMenus.OnClickData,
	tab: Browser.tabs.Tab | undefined
): QuickCapture | null {
	if (info.menuItemId === ADD_LINK_MENU_ID && info.linkUrl) {
		return { name: info.linkUrl, url: info.linkUrl };
	}

	if (info.menuItemId === ADD_SELECTION_MENU_ID && tab?.url) {
		return {
			name: tab.title ?? tab.url,
			url: tab.url,
			description: info.selectionText ?? null,
		};
	}

	if (info.menuItemId === ADD_PAGE_MENU_ID && tab?.url) {
		return { name: tab.title ?? tab.url, url: tab.url };
	}

	return null;
}

async function notify(title: string, message: string): Promise<void> {
	await browser.notifications.create({
		type: 'basic',
		iconUrl: browser.runtime.getURL('/icon/128.png'),
		title,
		message,
	});
}

export async function handleContextMenuClick(
	info: Browser.contextMenus.OnClickData,
	tab: Browser.tabs.Tab | undefined
): Promise<void> {
	const capture = resolveQuickCapture(info, tab);
	if (!capture) {
		return;
	}

	const cache = await collectionsCacheStorage.getValue();
	if (findLinkByUrl(cache.collections, capture.url)) {
		await notify('Already in MyLinks', capture.name);
		return;
	}

	try {
		await createLink({ ...capture, favorite: false });
		await notify('Added to MyLinks', capture.name);
		await syncCollections();
	} catch {
		await notify(
			"Couldn't add to MyLinks",
			'Check your connection and try again.'
		);
	}
}
