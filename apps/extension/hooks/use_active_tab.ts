import { useEffect, useState } from 'react';

export interface ActiveTabInfo {
	title: string;
	url: string;
}

function toActiveTabInfo(
	tab: Browser.tabs.Tab | undefined
): ActiveTabInfo | null {
	if (!tab?.url) {
		return null;
	}

	return { title: tab.title ?? tab.url, url: tab.url };
}

/**
 * Tracks the current window's active tab for quick-add prefill. The side
 * panel stays open across tab switches (it's not tied to a single tab), so
 * this re-queries on `tabs.onActivated`/`onUpdated` rather than once on
 * mount — otherwise quick-add would keep offering to save whatever tab was
 * active when the panel first opened.
 */
export function useActiveTab(): ActiveTabInfo | null {
	const [activeTab, setActiveTab] = useState<ActiveTabInfo | null>(null);

	useEffect(() => {
		const refreshActiveTab = () => {
			void browser.tabs
				.query({ active: true, currentWindow: true })
				.then(([tab]) => setActiveTab(toActiveTabInfo(tab)));
		};

		refreshActiveTab();
		browser.tabs.onActivated.addListener(refreshActiveTab);
		browser.tabs.onUpdated.addListener(refreshActiveTab);

		return () => {
			browser.tabs.onActivated.removeListener(refreshActiveTab);
			browser.tabs.onUpdated.removeListener(refreshActiveTab);
		};
	}, []);

	return activeTab;
}
