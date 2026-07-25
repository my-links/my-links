import type { InboundChange } from '@/lib/bookmarks/inbound';

/**
 * A stable signature for a set of native-to-server changes.
 *
 * Every push is followed by a resync, so a converging change disappears from
 * the next pass. Seeing the very same set twice in a row therefore means the
 * server did not record what was asked of it — the write is being rewritten,
 * re-detected and pushed again. Two loops of exactly that shape have already
 * shipped (a URL both sides normalise differently, an empty collection set
 * the server refills), and each one hammered the API until the rate limiter
 * cut in, because successful writes never trip the failure backoff.
 *
 * Comparing signatures turns that into a caught, backed-off error instead of
 * a flood.
 */
export function fingerprintInboundChanges(changes: InboundChange[]): string {
	return JSON.stringify([...changes].map(describeChange).sort());
}

function describeChange(change: InboundChange): string {
	switch (change.kind) {
		case 'create-link':
			return `create-link:${change.nodeId}:${change.collectionId}:${change.name}:${change.url}`;
		case 'update-link':
			return [
				'update-link',
				change.linkId,
				change.name,
				change.url,
				change.description ?? '',
				change.favorite,
				change.collectionIds.join(','),
			].join(':');
		case 'rename-collection':
			return `rename-collection:${change.collectionId}:${change.name}`;
	}
}
