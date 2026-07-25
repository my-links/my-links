import { describe, expect, it } from 'vitest';

import { areSameBookmarkUrl } from '@/lib/bookmarks/url_match';

describe('areSameBookmarkUrl', () => {
	it('should treat the trailing slash the browser adds to a bare origin as the same URL', () => {
		expect(
			areSameBookmarkUrl('https://example.com', 'https://example.com/')
		).toBe(true);
	});

	it('should still see a real change of path', () => {
		expect(
			areSameBookmarkUrl('https://example.com/one', 'https://example.com/two')
		).toBe(false);
	});

	it('should see a change of host', () => {
		expect(
			areSameBookmarkUrl('https://example.com', 'https://example.org')
		).toBe(false);
	});

	it('should compare unparsable values verbatim rather than claiming a match', () => {
		expect(areSameBookmarkUrl('not a url', 'not a url')).toBe(true);
		expect(areSameBookmarkUrl('not a url', 'other nonsense')).toBe(false);
	});

	it('should not match a missing URL against a present one', () => {
		expect(areSameBookmarkUrl(undefined, 'https://example.com')).toBe(false);
	});
});
