export type Favicon = {
	buffer: Buffer;
	url: string;
	type: string;
	size: number;
	etag?: string | null;
	lastModified?: string | null;
};
