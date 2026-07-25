import type { ServerChange } from '@/lib/bookmarks/operations';

/**
 * A stable signature for a set of changes pushed to the server.
 *
 * Purely a safety net. Convergence is the merge's job — a change derived
 * against the snapshot disappears from the next pass once it has been written
 * — and this only catches the case where that reasoning is wrong: the same
 * set of pushes twice in a row means the server is not recording what it is
 * told, so the pass is failed and backed off instead of hammering the API
 * until the rate limiter cuts in. Successful writes never trip the failure
 * backoff on their own, which is how two such loops shipped before.
 */
export function fingerprintServerChanges(changes: ServerChange[]): string {
	return JSON.stringify([...changes].map(describeChange).sort());
}

function describeChange(change: ServerChange): string {
	switch (change.kind) {
		case 'create-link':
			return [
				'create-link',
				change.nodeId,
				change.collectionId,
				change.name,
				change.url,
				change.favorite,
				change.placement,
			].join(':');
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
