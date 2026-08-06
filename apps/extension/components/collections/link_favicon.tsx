import { useState } from 'react';

import { buildEmptyImageUrl } from '@/lib/instance_urls';

const FAVICON_SIZE_PX = 20;

interface LinkFaviconProps {
	faviconUrl: string;
	instanceUrl: string;
}

export function LinkFavicon({
	faviconUrl,
	instanceUrl,
}: Readonly<LinkFaviconProps>) {
	const [hasFailed, setHasFailed] = useState(false);

	const handleError = () => setHasFailed(true);

	if (hasFailed) {
		return (
			<img
				src={buildEmptyImageUrl(instanceUrl)}
				width={FAVICON_SIZE_PX}
				height={FAVICON_SIZE_PX}
				alt="URL favicon not found"
				decoding="async"
				draggable={false}
				className="flex-shrink-0 rounded"
			/>
		);
	}

	return (
		<img
			src={faviconUrl}
			onError={handleError}
			width={FAVICON_SIZE_PX}
			height={FAVICON_SIZE_PX}
			alt="URL favicon"
			decoding="async"
			draggable={false}
			className="flex-shrink-0 rounded"
		/>
	);
}
