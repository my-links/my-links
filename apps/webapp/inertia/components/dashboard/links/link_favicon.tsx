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
}: Readonly<LinkFaviconProps>) => (
	<img
		src={`/favicon?url=${url}${cacheBust ? `&v=${cacheBust}` : ''}`}
		height={size}
		width={size}
		alt="icon"
		decoding="async"
		className="rounded flex-shrink-0"
	/>
);
