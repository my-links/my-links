import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Trans as TransComponent } from '@lingui/react';

interface CreateTokenModalProps {
	onCreate: (name: string) => Promise<void>;
	onClose: () => void;
}

export function CreateTokenModal({ onCreate, onClose }: CreateTokenModalProps) {
	const [tokenName, setTokenName] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleCreate = async () => {
		if (!tokenName.trim()) return;

		setIsLoading(true);
		try {
			await onCreate(tokenName);
			onClose();
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Stack>
			<Text size="sm" c="dimmed">
				<Trans>Create a new API token to access the API</Trans>
			</Text>
			<TextInput
				label={<TransComponent id="api-tokens.name" message="Token name" />}
				placeholder={
					<TransComponent
						id="api-tokens.name-placeholder"
						message="Enter token name"
					/>
				}
				value={tokenName}
				onChange={(e) => setTokenName(e.target.value)}
				required
			/>
			<Group justify="flex-end">
				<Button variant="subtle" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button
					onClick={handleCreate}
					disabled={!tokenName.trim() || isLoading}
					loading={isLoading}
				>
					<Trans>Create token</Trans>
				</Button>
			</Group>
		</Stack>
	);
}
