import { useState } from 'react';

const FAVICON_SIZE_PX = 20;

interface LinkFaviconProps {
	faviconUrl: string;
}

export function LinkFavicon({ faviconUrl }: Readonly<LinkFaviconProps>) {
	const [hasFailed, setHasFailed] = useState(false);

	const handleError = () => setHasFailed(true);

	if (hasFailed) {
		return (
			<div
				className="i-themify-world flex-shrink-0 text-gray-400 dark:text-gray-500"
				style={{ width: FAVICON_SIZE_PX, height: FAVICON_SIZE_PX }}
			/>
		);
	}

	return (
		<img
			src={faviconUrl}
			onError={handleError}
			width={FAVICON_SIZE_PX}
			height={FAVICON_SIZE_PX}
			alt=""
			decoding="async"
			className="flex-shrink-0 rounded"
		/>
	);
}
