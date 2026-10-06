import { ConcurrencyLimiter } from '#services/favicons/concurrency_limiter';

const FAVICON_FETCH_CONCURRENCY = 8;

export class FaviconFetchLimiter extends ConcurrencyLimiter {
	constructor() {
		super(FAVICON_FETCH_CONCURRENCY);
	}
}
