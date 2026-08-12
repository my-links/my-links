import React from 'react';
import ReactDOM from 'react-dom/client';
import type { ComponentType } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { collectionsCacheStorage } from '@/lib/storage';
import { COLLECTIONS_QUERY_KEY } from '@/hooks/use_collections';

export class RootElementNotFoundError extends Error {
	constructor() {
		super('Root element not found');
	}
}

/**
 * Shared by every entrypoint that renders `CollectionsWorkspace` (sidepanel,
 * newtab): hydrates a fresh `QueryClient` from the last known-good snapshot
 * in `collectionsCacheStorage` before the first render, so opening either
 * surface never shows a blank/loading state as long as a sync has ever
 * succeeded.
 */
export async function mountCollectionsApp(
	AppComponent: ComponentType
): Promise<void> {
	const rootElement = document.getElementById('root');
	if (!rootElement) {
		throw new RootElementNotFoundError();
	}

	const queryClient = new QueryClient();
	const cachedCollections = await collectionsCacheStorage.getValue();
	if (cachedCollections.collections.length > 0) {
		queryClient.setQueryData(
			COLLECTIONS_QUERY_KEY,
			cachedCollections.collections
		);
	}

	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<AppComponent />
			</QueryClientProvider>
		</React.StrictMode>
	);
}
