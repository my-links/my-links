import type { ApplicationService } from '@adonisjs/core/types';

import { LinkService } from '#services/links/link_service';
import { McpSessionManager } from '#services/mcp/mcp_session_manager';
import { CollectionService } from '#services/collections/collection_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';

/**
 * `McpSessionManager` holds a `sessionId -> transport` map that has to
 * survive across requests for the lifetime of an MCP session, so it needs
 * the container's singleton lifetime rather than the per-resolution default.
 *
 * The factory below builds it by hand rather than `resolver.make(McpSessionManager)`
 * — asking the resolver to make the very class this binding is registered
 * for routes straight back into this same factory, recursing forever.
 */
export default class McpProvider {
	constructor(protected app: ApplicationService) {}

	register() {
		this.app.container.singleton(McpSessionManager, async (resolver) => {
			const [
				linkService,
				collectionService,
				collectionLinkService,
				collectionFollowerService,
			] = await Promise.all([
				resolver.make(LinkService),
				resolver.make(CollectionService),
				resolver.make(CollectionLinkService),
				resolver.make(CollectionFollowerService),
			]);

			return new McpSessionManager(
				linkService,
				collectionService,
				collectionLinkService,
				collectionFollowerService
			);
		});
	}
}
