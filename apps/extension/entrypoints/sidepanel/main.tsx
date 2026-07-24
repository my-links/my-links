import '@minimalstuff/ui/style.css';
import 'virtual:uno.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.tsx';
import { collectionsCacheStorage } from '@/lib/storage';
import { COLLECTIONS_QUERY_KEY } from '@/hooks/use_collections';

const queryClient = new QueryClient();

/**
 * Hydrates the query cache from the last known-good snapshot before the
 * first render — the panel opening never shows a blank/loading state as
 * long as any sync has ever succeeded, even though this is a fresh
 * `QueryClient` with no memory of previous panel instances.
 */
async function renderApp(): Promise<void> {
	const rootElement = document.getElementById('root');
	if (!rootElement) {
		throw new Error('Root element not found');
	}

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
				<App />
			</QueryClientProvider>
		</React.StrictMode>
	);
}

void renderApp();
