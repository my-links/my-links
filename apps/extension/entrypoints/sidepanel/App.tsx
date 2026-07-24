import { useEffect, useState } from 'react';
import { Button, ModalProvider, ThemeToggle } from '@minimalstuff/ui';

import { SearchPanel } from '@/components/search/search_panel';
import { apiTokenStorage, instanceUrlStorage } from '@/lib/storage';
import { QuickAddButton } from '@/components/quick_add/quick_add_button';
import { NewCollectionButton } from '@/components/collections/new_collection_button';

function App() {
	const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
	const [instanceUrl, setInstanceUrl] = useState('');

	useEffect(() => {
		void Promise.all([
			instanceUrlStorage.getValue(),
			apiTokenStorage.getValue(),
		]).then(([storedInstanceUrl, token]) => {
			setInstanceUrl(storedInstanceUrl);
			setIsConfigured(Boolean(storedInstanceUrl && token));
		});
	}, []);

	if (isConfigured === null) {
		return null;
	}

	if (!isConfigured) {
		return (
			<main className="min-h-screen flex flex-col gap-3 items-start p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
				<p className="text-sm">MyLinks isn't connected yet.</p>
				<Button
					color="primary"
					size="sm"
					onClick={() => void browser.runtime.openOptionsPage()}
				>
					Open settings
				</Button>
			</main>
		);
	}

	return (
		<main className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<ModalProvider />
			<div className="flex items-center justify-between gap-2 p-4 pb-2">
				<p className="text-sm truncate">Connected to {instanceUrl}.</p>
				<div className="flex flex-shrink-0 items-center gap-1">
					<QuickAddButton />
					<NewCollectionButton />
					<ThemeToggle size="sm" />
				</div>
			</div>
			<SearchPanel />
		</main>
	);
}

export default App;
