import { useFaviconEpoch } from '~/hooks/use_favicon_epoch';

interface LinkFaviconProps {
	url: string;
	size?: number;
	/** Bumped after a manual refresh so the browser doesn't keep serving the `/favicon` response it already cached for this exact URL. */
	cacheBust?: number;
}

export const LinkFavicon = ({
	url,
	size = 32,
	cacheBust,
}: Readonly<LinkFaviconProps>) => {
	const epoch = useFaviconEpoch();
	const version = cacheBust ? `${epoch}.${cacheBust}` : epoch;

	return (
		<img
			src={`/favicon?url=${url}&v=${version}`}
			height={size}
			width={size}
			alt="icon"
			decoding="async"
			className="rounded flex-shrink-0"
		/>
	);
};
