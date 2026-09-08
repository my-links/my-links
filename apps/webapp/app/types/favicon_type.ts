export type Favicon = {
	buffer: Buffer;
	url: string;
	type: string;
	size: number;
	etag?: string | null;
	lastModified?: string | null;
	/** A monogram or other stand-in served while the real icon is still resolving — must never be cached long, or the browser never comes back for it. */
	isPlaceholder?: boolean;
};
