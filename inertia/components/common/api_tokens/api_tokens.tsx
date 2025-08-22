import { usePage } from '@inertiajs/react';
import {
	ActionIcon,
	Button,
	Card,
	CopyButton,
	Group,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import { TbPlus, TbTrash } from 'react-icons/tb';
import { SimpleTable } from '~/components/common/simple_table/simple_table';
import { useApiTokens } from '~/hooks/use_api_tokens';
import { ApiToken } from '~/types/app';
import { CreateTokenModal } from './create_token_modal';

const useGetCreatedToken = () => {
	const newlyCreatedToken = usePage<{
		token?: ApiToken;
	}>().props.token;
	return newlyCreatedToken;
};

export function ApiTokens() {
	const { t } = useTranslation();
	const { tokens, createToken, revokeToken } = useApiTokens();

	const newlyCreatedToken = useGetCreatedToken();

	const handleCreateTokenModal = () => {
		modals.open({
			title: t('api-tokens.create-new'),
			children: (
				<CreateTokenModal
					onCreate={(name) => createToken(name)}
					onClose={() => modals.closeAll()}
				/>
			),
		});
	};

	const handleRevokeToken = async (tokenId: number) => {
		const token = tokens.find((t) => t.identifier === tokenId);
		if (!token) return;

		modals.openConfirmModal({
			title: (
				<>
					{t('api-tokens.revoke')} "<strong>{token.name}</strong>"
				</>
			),
			children: <Text size="sm">{t('api-tokens.confirm-revoke')}</Text>,
			labels: {
				confirm: t('api-tokens.revoke'),
				cancel: t('cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => revokeToken(tokenId),
		});
	};

	const generateTokenRow = (token: ApiToken) =>
		newlyCreatedToken?.identifier === token.identifier && (
			<>
				<Text c="green" size="sm">
					{t('api-tokens.new-token')}{' '}
					{newlyCreatedToken.token && (
						<CopyButton value={newlyCreatedToken.token}>
							{({ copied, copy }) => (
								<Button
									color={copied ? 'teal' : 'blue'}
									onClick={copy}
									size="xs"
									variant="light"
								>
									{copied ? t('copied') : t('copy')}
								</Button>
							)}
						</CopyButton>
					)}
				</Text>
			</>
		);

	const generateRow = (token: ApiToken) => ({
		key: token.identifier.toString(),
		name: token.name,
		token: generateTokenRow(token) || undefined,
		expiresAt: token.expiresAt,
		lastUsedAt: token.lastUsedAt,
		actions: [
			<ActionIcon
				color="red"
				variant="subtle"
				onClick={() => handleRevokeToken(token.identifier)}
			>
				<TbTrash size={16} />
			</ActionIcon>,
		],
	});

	const rows = tokens.map(generateRow);

	return (
		<Card withBorder>
			<Group justify="space-between" mb="md">
				<Text fw={500}>{t('api-tokens.title')}</Text>
				<Button
					leftSection={<TbPlus size={16} />}
					onClick={handleCreateTokenModal}
					size="sm"
					variant="light"
				>
					{t('api-tokens.create')}
				</Button>
			</Group>

			{tokens.length === 0 && (
				<Text c="dimmed" ta="center" py="xl">
					{t('api-tokens.no-tokens')}
				</Text>
			)}

			{tokens.length > 0 && <SimpleTable data={rows} />}
		</Card>
	);
}
