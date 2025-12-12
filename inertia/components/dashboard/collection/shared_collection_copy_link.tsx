import { Badge, CopyButton } from '@mantine/core';
import { t } from 'i18next';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { useAppUrl } from '~/hooks/use_app_url';

const COPY_TIMEOUT = 3_000;

export function SharedCollectionCopyLink() {
	const appUrl = useAppUrl();
	const activeCollection = useActiveCollection();

	if (!activeCollection) {
		return null;
	}

	const copyUrl = `${appUrl}/shared/${activeCollection.id}`;
	return (
		<CopyButton value={copyUrl} timeout={COPY_TIMEOUT}>
			{({ copied, copy }) => (
				<Badge
					variant={copied ? 'filled' : 'light'}
					onClick={copy}
					style={{ cursor: 'pointer' }}
				>
					{copied ? t('success-copy') : t('visibility.public')}
					{!copied && (
						<span
							className="i-tabler-copy inline-block"
							style={{ marginLeft: 4 }}
						/>
					)}
				</Badge>
			)}
		</CopyButton>
	);
}
