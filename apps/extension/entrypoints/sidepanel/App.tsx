import { useEffect, useState } from 'react';
import { Button, ThemeToggle } from '@minimalstuff/ui';

import { apiTokenStorage, instanceUrlStorage } from '@/lib/storage';
import { CollectionTree } from '@/components/collections/collection_tree';

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
			<div className="flex items-center justify-between gap-2 p-4 pb-2">
				<p className="text-sm truncate">Connected to {instanceUrl}.</p>
				<ThemeToggle size="sm" />
			</div>
			<CollectionTree />
		</main>
	);
}

export default App;
