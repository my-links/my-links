interface LinkFaviconProps {
	url: string;
	size?: number;
}

export const LinkFavicon = ({ url, size = 32 }: Readonly<LinkFaviconProps>) => (
	<img
		src={`/favicon?url=${url}`}
		height={size}
		width={size}
		alt="icon"
		decoding="async"
		className="rounded flex-shrink-0"
	/>
);
