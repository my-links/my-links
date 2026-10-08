/** Structural subset shared by the Node `Response` and impit's `ImpitResponse`. */
export type FaviconHttpResponse = {
	readonly ok: boolean;
	readonly status: number;
	readonly url: string;
	readonly headers: Headers;
	readonly body: ReadableStream<Uint8Array> | null;
	json(): Promise<unknown>;
};
