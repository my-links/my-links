import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import {
	ActionIcon,
	Button,
	Card,
	CopyButton,
	Group,
	Text,
} from '@mantine/core';
import { modals } from '@mantine/modals';
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
	const { tokens, createToken, revokeToken } = useApiTokens();

	const newlyCreatedToken = useGetCreatedToken();

	const handleCreateTokenModal = () => {
		modals.open({
			title: <Trans>Create new token</Trans>,
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
					<Trans>Revoke</Trans> "<strong>{token.name}</strong>"
				</>
			),
			children: (
				<Text size="sm">
					<Trans>Are you sure you want to revoke this token?</Trans>
				</Text>
			),
			labels: {
				confirm: <Trans>Revoke</Trans>,
				cancel: <Trans>Cancel</Trans>,
			},
			confirmProps: { color: 'red' },
			onConfirm: () => revokeToken(tokenId),
		});
	};

	const generateTokenRow = (token: ApiToken) =>
		newlyCreatedToken?.identifier === token.identifier && (
			<>
				<Text c="green" size="sm">
					<Trans>New token created</Trans>{' '}
					{newlyCreatedToken.token && (
						<CopyButton value={newlyCreatedToken.token}>
							{({ copied, copy }) => (
								<Button
									color={copied ? 'teal' : 'blue'}
									onClick={copy}
									size="xs"
									variant="light"
								>
									{copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
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
				<div
					className="i-tabler-trash"
					style={{ width: '16px', height: '16px' }}
				/>
			</ActionIcon>,
		],
	});

	const rows = tokens.map(generateRow);

	return (
		<Card withBorder>
			<Group justify="space-between" mb="md">
				<Text fw={500}>
					<Trans>API Tokens</Trans>
				</Text>
				<Button
					leftSection={
						<div
							className="i-tabler-plus"
							style={{ width: '16px', height: '16px' }}
						/>
					}
					onClick={handleCreateTokenModal}
					size="sm"
					variant="light"
				>
					<Trans>Create token</Trans>
				</Button>
			</Group>

			{tokens.length === 0 && (
				<Text c="dimmed" ta="center" py="xl">
					<Trans>No tokens created yet</Trans>
				</Text>
			)}

			{tokens.length > 0 && <SimpleTable data={rows} />}
		</Card>
	);
}
