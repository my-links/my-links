import { ActionIcon, Anchor, CopyButton, Popover, Text } from '@mantine/core';
import { Fragment } from 'react/jsx-runtime';
import { Trans } from '@lingui/react/macro';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { generateShareUrl } from '~/lib/navigation';
import { Visibility } from '~/types/app';

const COPY_SUCCESS_TIMEOUT = 2_000;

export function ShareCollection() {
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
				<Text c="dimmed">
					<Trans>Click to copy</Trans>
				</Text>
				<CopyButton value={sharedUrl} timeout={COPY_SUCCESS_TIMEOUT}>
					{({ copied, copy }) =>
						!copied ? (
							<Anchor onClick={copy}>{sharedUrl}</Anchor>
						) : (
							<Text c="green">
								<Trans>Copied!</Trans>
							</Text>
						)
					}
				</CopyButton>
			</Popover.Dropdown>
		</Popover>
	);
}
