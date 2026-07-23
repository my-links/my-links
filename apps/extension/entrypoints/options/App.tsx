import './style.css';

import { useEffect, useState } from 'react';

import { connectToInstance, disconnectFromInstance } from '@/lib/api/auth';
import {
	apiTokenStorage,
	DEFAULT_INSTANCE_URL,
	instanceUrlStorage,
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
	}, []);

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

	return (
		<main className="options">
			<h1>MyLinks</h1>

			<label htmlFor="instance-url">Instance URL</label>
			<input
				id="instance-url"
				type="url"
				value={instanceUrlInput}
				onChange={(event) => setInstanceUrlInput(event.target.value)}
				placeholder="https://mylinks.example.com"
				disabled={isConnecting || status.kind === 'connected'}
			/>

			{status.kind === 'connected' ? (
				<>
					<p className="status status-connected">
						Connected to {status.instanceUrl}
					</p>
					<button onClick={() => void handleDisconnect()}>Disconnect</button>
				</>
			) : (
				<button onClick={() => void handleConnect()} disabled={isConnecting}>
					{isConnecting ? 'Connecting…' : 'Connect'}
				</button>
			)}

			{status.kind === 'error' && (
				<p className="status status-error">{status.message}</p>
			)}
		</main>
	);
}

export default App;
