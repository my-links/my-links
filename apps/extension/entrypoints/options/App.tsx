import { useEffect, useState } from 'react';
import { Button, Input, Switch, ThemeToggle } from '@minimalstuff/ui';

import { connectToInstance, disconnectFromInstance } from '@/lib/api/auth';
import { BookmarkMirrorSection } from '@/components/bookmarks/bookmark_mirror_section';
import {
	apiTokenStorage,
	DEFAULT_INSTANCE_URL,
	instanceUrlStorage,
	newTabOverrideStorage,
} from '@/lib/storage';

type ConnectionStatus =
	| { kind: 'idle' }
	| { kind: 'connecting' }
	| { kind: 'connected'; instanceUrl: string }
	| { kind: 'error'; message: string };

function App() {
	const [instanceUrlInput, setInstanceUrlInput] =
		useState(DEFAULT_INSTANCE_URL);
	const [status, setStatus] = useState<ConnectionStatus>({ kind: 'idle' });
	const [isNewTabEnabled, setIsNewTabEnabled] = useState(true);

	useEffect(() => {
		void Promise.all([
			instanceUrlStorage.getValue(),
			apiTokenStorage.getValue(),
		]).then(([storedInstanceUrl, token]) => {
			setInstanceUrlInput(storedInstanceUrl || DEFAULT_INSTANCE_URL);
			if (token) {
				setStatus({ kind: 'connected', instanceUrl: storedInstanceUrl });
			}
		});
		void newTabOverrideStorage.getValue().then(setIsNewTabEnabled);
	}, []);

	const handleNewTabToggle = async (isEnabled: boolean) => {
		setIsNewTabEnabled(isEnabled);
		await newTabOverrideStorage.setValue(isEnabled);
	};

	const handleConnect = async () => {
		setStatus({ kind: 'connecting' });
		try {
			await connectToInstance(instanceUrlInput);
			const storedInstanceUrl = await instanceUrlStorage.getValue();
			setStatus({ kind: 'connected', instanceUrl: storedInstanceUrl });
		} catch (error) {
			setStatus({
				kind: 'error',
				message: error instanceof Error ? error.message : 'Connection failed.',
			});
		}
	};

	const handleDisconnect = async () => {
		await disconnectFromInstance();
		setStatus({ kind: 'idle' });
	};

	const isConnecting = status.kind === 'connecting';
	const isConnected = status.kind === 'connected';

	return (
		<main className="min-h-screen flex justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<div className="w-full max-w-md flex flex-col gap-4 px-6 py-10">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-semibold">MyLinks</h1>
					<ThemeToggle size="sm" />
				</div>

				<Switch
					label="Open on new tab"
					description="Show the collections workspace when you open a new tab."
					checked={isNewTabEnabled}
					onChange={(event) => void handleNewTabToggle(event.target.checked)}
				/>

				<Input
					label="Instance URL"
					type="url"
					value={instanceUrlInput}
					onChange={(event) => setInstanceUrlInput(event.target.value)}
					placeholder="https://mylinks.example.com"
					disabled={isConnecting || isConnected}
				/>

				{isConnected ? (
					<>
						<p className="text-sm text-green-700 dark:text-green-400">
							Connected to {status.instanceUrl}
						</p>
						<Button
							color="neutral"
							variant="outline"
							onClick={() => void handleDisconnect()}
						>
							Disconnect
						</Button>
					</>
				) : (
					<Button
						color="primary"
						loading={isConnecting}
						disabled={isConnecting}
						onClick={() => void handleConnect()}
					>
						{isConnecting ? 'Connecting…' : 'Connect'}
					</Button>
				)}

				{status.kind === 'error' && (
					<p className="text-sm text-red-700 dark:text-red-400">
						{status.message}
					</p>
				)}

				{isConnected && <BookmarkMirrorSection />}
			</div>
		</main>
	);
}

export default App;
