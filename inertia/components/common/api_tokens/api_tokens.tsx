import {
	ActionIcon,
	Badge,
	Button,
	Card,
	CopyButton,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { TbCheck, TbCopy, TbPlus, TbTrash } from 'react-icons/tb';
import { useApiTokens } from '~/hooks/use_api_tokens';
import { CreateTokenModal } from './create_token_modal';

export function ApiTokens() {
	const { t } = useTranslation();
	const { tokens, createToken, revokeToken } = useApiTokens();

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

	const handleRevokeToken = async (tokenId: number, tokenName: string) => {
		modals.openConfirmModal({
			title: t('api-tokens.revoke'),
			children: (
				<Text size="sm">
					{t('api-tokens.confirm-revoke')} <strong>{tokenName}</strong>?
				</Text>
			),
			labels: {
				confirm: t('api-tokens.revoke'),
				cancel: t('common.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => revokeToken(tokenId),
		});
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return t('api-tokens.never');
		return DateTime.fromISO(dateString).toRelative();
	};

	const isExpired = (expiresAt: string | null) => {
		if (!expiresAt) return false;
		return DateTime.fromISO(expiresAt) < DateTime.now();
	};

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

			<Stack gap="sm">
				{tokens.length === 0 ? (
					<Text c="dimmed" ta="center" py="xl">
						{t('api-tokens.no-tokens')}
					</Text>
				) : (
					tokens.map((token) => (
						<Card
							key={token.id}
							withBorder
							p="sm"
							opacity={token.isActive ? 1 : 0.5}
						>
							<Group justify="space-between" align="flex-start">
								<Stack gap="xs" style={{ flex: 1 }}>
									<Group gap="xs">
										<Text fw={500}>{token.name}</Text>
										{isExpired(token.expiresAt) && (
											<Badge color="red" variant="light" size="xs">
												{t('api-tokens.expired')}
											</Badge>
										)}
										{!token.isActive && (
											<Badge color="gray" variant="light" size="xs">
												{t('api-tokens.revoked')}
											</Badge>
										)}
									</Group>
									<Text size="xs" c="dimmed">
										{t('api-tokens.created')}: {formatDate(token.createdAt)}
									</Text>
									<Text size="xs" c="dimmed">
										{t('api-tokens.last-used')}: {formatDate(token.lastUsedAt)}
									</Text>
									{token.expiresAt && (
										<Text size="xs" c="dimmed">
											{t('api-tokens.expires')}: {formatDate(token.expiresAt)}
										</Text>
									)}
								</Stack>
								{token.isActive && (
									<Group gap="xs">
										<CopyButton value={token.token} timeout={2000}>
											{({ copied, copy }) => (
												<Tooltip
													label={
														copied
															? t('api-tokens.copied')
															: t('api-tokens.copy')
													}
												>
													<ActionIcon
														color={copied ? 'teal' : 'blue'}
														onClick={copy}
														variant="subtle"
													>
														{copied ? (
															<TbCheck size={16} />
														) : (
															<TbCopy size={16} />
														)}
													</ActionIcon>
												</Tooltip>
											)}
										</CopyButton>
										<Tooltip label={t('api-tokens.revoke')}>
											<ActionIcon
												color="red"
												variant="subtle"
												onClick={() => handleRevokeToken(token.id, token.name)}
											>
												<TbTrash size={16} />
											</ActionIcon>
										</Tooltip>
									</Group>
								)}
							</Group>
						</Card>
					))
				)}
			</Stack>
		</Card>
	);
}
