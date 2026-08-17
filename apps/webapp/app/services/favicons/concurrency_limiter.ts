export class ConcurrencyLimiter {
	private activeCount = 0;
	private readonly waiters: Array<() => void> = [];

	constructor(private readonly maxConcurrent: number) {}

	async run<TResult>(task: () => Promise<TResult>): Promise<TResult> {
		await this.acquire();
		try {
			return await task();
		} finally {
			this.release();
		}
	}

	private acquire(): Promise<void> {
		if (this.activeCount < this.maxConcurrent) {
			this.activeCount += 1;
			return Promise.resolve();
		}

		return new Promise((resolve) => {
			this.waiters.push(() => {
				this.activeCount += 1;
				resolve();
			});
		});
	}

	private release(): void {
		this.activeCount -= 1;
		this.waiters.shift()?.();
	}
}

// Module-level singleton: FaviconService/FaviconsController are resolved per request, this has to outlive them to be shared.
const FAVICON_FETCH_CONCURRENCY = 8;

export const faviconFetchLimiter = new ConcurrencyLimiter(
	FAVICON_FETCH_CONCURRENCY
);
