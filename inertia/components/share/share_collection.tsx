import { ActionIcon, Anchor, CopyButton, Popover, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Fragment } from 'react/jsx-runtime';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { generateShareUrl } from '~/lib/navigation';
import { Visibility } from '~/types/app';

const COPY_SUCCESS_TIMEOUT = 2_000;

export function ShareCollection() {
	const { t } = useTranslation('common');
	const activeCollection = useActiveCollection();
	if (
		activeCollection?.visibility !== Visibility.PUBLIC ||
		typeof window === 'undefined'
	)
		return <Fragment />;

	const sharedUrl = generateShareUrl(activeCollection);
	return (
		<Popover position="bottom" withArrow shadow="md">
			<Popover.Target>
				<ActionIcon variant="subtle" color="var(--mantine-color-text)">
					<div className="i-tabler-share-3" />
				</ActionIcon>
			</Popover.Target>
			<Popover.Dropdown p="xs">
				<Text c="dimmed">{t('click-to-copy')}</Text>
				<CopyButton value={sharedUrl} timeout={COPY_SUCCESS_TIMEOUT}>
					{({ copied, copy }) =>
						!copied ? (
							<Anchor onClick={copy}>{sharedUrl}</Anchor>
						) : (
							<Text c="green">{t('success-copy')}</Text>
						)
					}
				</CopyButton>
			</Popover.Dropdown>
		</Popover>
	);
}
