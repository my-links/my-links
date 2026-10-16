import { describe, expect, it } from 'vitest';

import type { CollectionWithLinks } from '@/lib/api/types';
import { findAccountIdentity } from '@/lib/api/account_identity';

const INSTANCE_URL = 'https://mylinks.example.com';

function buildCollection(
	overrides: Partial<CollectionWithLinks>
): CollectionWithLinks {
	return { isOwner: true, authorId: 7, ...overrides } as CollectionWithLinks;
}

describe('findAccountIdentity', () => {
	it('should scope the owner id by instance', () => {
		expect(findAccountIdentity(INSTANCE_URL, [buildCollection({})])).toBe(
			`${INSTANCE_URL}#7`
		);
	});

	it('should ignore collections the user does not own', () => {
		const collections = [
			buildCollection({ isOwner: false, authorId: 99 }),
			buildCollection({ authorId: 7 }),
		];

		expect(findAccountIdentity(INSTANCE_URL, collections)).toBe(
			`${INSTANCE_URL}#7`
		);
	});

	it('should return null when the account owns no collection', () => {
		expect(findAccountIdentity(INSTANCE_URL, [])).toBeNull();
	});
});
