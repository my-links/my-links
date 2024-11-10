import { ActionIcon, Anchor, CopyButton, Popover, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TbShare3 } from 'react-icons/tb';
import { Fragment } from 'react/jsx-runtime';
import { generateShareUrl } from '~/lib/navigation';
import { useActiveCollection } from '~/stores/collection_store';
import { Visibility } from '~/types/app';

const COPY_SUCCESS_TIMEOUT = 2_000;

export function ShareCollection() {
	const { t } = useTranslation('common');
	const { activeCollection } = useActiveCollection();
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
					<TbShare3 />
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
