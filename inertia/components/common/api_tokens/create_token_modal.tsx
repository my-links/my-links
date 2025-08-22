import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CreateTokenModalProps {
	onCreate: (name: string) => Promise<void>;
	onClose: () => void;
}

export function CreateTokenModal({ onCreate, onClose }: CreateTokenModalProps) {
	const { t } = useTranslation();
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
				{t('api-tokens.create-description')}
			</Text>
			<TextInput
				label={t('api-tokens.name')}
				placeholder={t('api-tokens.name-placeholder')}
				value={tokenName}
				onChange={(e) => setTokenName(e.target.value)}
				required
			/>
			<Group justify="flex-end">
				<Button variant="subtle" onClick={onClose}>
					{t('cancel')}
				</Button>
				<Button
					onClick={handleCreate}
					disabled={!tokenName.trim() || isLoading}
					loading={isLoading}
				>
					{t('api-tokens.create')}
				</Button>
			</Group>
		</Stack>
	);
}
