import './style.css';

import { useEffect, useState } from 'react';

import { apiTokenStorage, instanceUrlStorage } from '@/lib/storage';

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
			<main className="sidepanel sidepanel-empty">
				<p>MyLinks isn't connected yet.</p>
				<button onClick={() => void browser.runtime.openOptionsPage()}>
					Open settings
				</button>
			</main>
		);
	}

	return (
		<main className="sidepanel">
			<p>Connected to {instanceUrl}.</p>
			<p className="sidepanel-note">
				Collections and links are coming in the next phase.
			</p>
		</main>
	);
}

export default App;
