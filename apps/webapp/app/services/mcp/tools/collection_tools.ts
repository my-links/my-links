import { z } from 'zod';
import { HttpContext } from '@adonisjs/core/http';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type Collection from '#models/collection';
import { TOKEN_ABILITY } from '#constants/api_token';
import { runTool } from '#services/mcp/tools/tool_result';
import { resolveRequestOrigin } from '#lib/request_origin';
import { VISIBILITY } from '#enums/collections/visibility';
import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { CollectionQueryService } from '#services/collections/collection_query_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';

function getAuthenticatedUserId() {
	return HttpContext.getOrFail().auth.getUserOrFail().id;
}

function getRequestOrigin() {
	return resolveRequestOrigin(HttpContext.getOrFail());
}

type CollectionVariant = 'toObject' | 'withLinks' | 'withOwnLinks';

async function serializeCollection(
	collection: Collection,
	variant?: CollectionVariant
): Promise<unknown>;
async function serializeCollection(
	collections: Collection[],
	variant?: CollectionVariant
): Promise<unknown>;
async function serializeCollection(
	collection: Collection | Collection[],
	variant: CollectionVariant = 'toObject'
) {
	const { serialize } = HttpContext.getOrFail();
	return Array.isArray(collection)
		? serialize.withoutWrapping(
				CollectionTransformer.transform(collection).useVariant(variant)
			)
		: serialize.withoutWrapping(
				CollectionTransformer.transform(collection).useVariant(variant)
			);
}

export function registerCollectionTools(
	server: McpServer,
	collectionService: CollectionService,
	collectionQueryService: CollectionQueryService,
	collectionFollowerService: CollectionFollowerService
): void {
	server.registerTool(
		'collections.list',
		{
			description:
				'List the authenticated user’s own collections and the public collections they follow.',
		},
		() =>
			runTool(TOKEN_ABILITY.READ, async () => {
				const userId = getAuthenticatedUserId();
				const [owned, followed] = await Promise.all([
					collectionQueryService.getCollectionsForAuthenticatedUser(userId),
					collectionFollowerService.getFollowedCollectionsWithLinks(userId),
				]);
				return {
					owned: await serializeCollection(owned, 'withOwnLinks'),
					followed: await serializeCollection(followed, 'withLinks'),
				};
			})
	);

	server.registerTool(
		'collections.get',
		{
			description:
				'Get a single collection by id — the owner’s own, or a public one they follow.',
			inputSchema: { id: z.number().int().positive() },
		},
		({ id }) =>
			runTool(TOKEN_ABILITY.READ, async () => {
				const { collection } =
					await collectionQueryService.getAccessibleCollectionByIdWithLinks(
						id,
						getAuthenticatedUserId()
					);
				return serializeCollection(collection, 'withLinks');
			})
	);

	server.registerTool(
		'inbox.get',
		{
			description:
				'Get the authenticated user’s Inbox, their default collection.',
		},
		() =>
			runTool(TOKEN_ABILITY.READ, async () => {
				const userId = getAuthenticatedUserId();
				const inbox = await collectionService.getOrCreateDefaultCollection(
					userId,
					getRequestOrigin()
				);
				const { collection } =
					await collectionQueryService.getAccessibleCollectionByIdWithLinks(
						inbox.id,
						userId
					);
				return serializeCollection(collection, 'withLinks');
			})
	);

	server.registerTool(
		'collections.create',
		{
			description: 'Create a new collection.',
			inputSchema: {
				name: z.string().trim().min(1).max(254),
				description: z.string().trim().max(254).nullable().optional(),
				visibility: z.enum([VISIBILITY.PUBLIC, VISIBILITY.PRIVATE]),
				icon: z.string().trim().max(10).nullable().optional(),
			},
		},
		({ description, icon, ...payload }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				const collection = await collectionService.createCollection(
					getAuthenticatedUserId(),
					{
						...payload,
						description: description ?? null,
						icon: icon ?? null,
					},
					getRequestOrigin()
				);
				return {
					message: 'Collection created successfully',
					collection: await serializeCollection(collection),
				};
			})
	);

	server.registerTool(
		'collections.update',
		{
			description:
				'Update a collection’s name, description, visibility, or icon.',
			inputSchema: {
				id: z.number().int().positive(),
				name: z.string().trim().min(1).max(254),
				description: z.string().trim().max(254).nullable().optional(),
				visibility: z.enum([VISIBILITY.PUBLIC, VISIBILITY.PRIVATE]),
				icon: z.string().trim().max(10).nullable().optional(),
			},
		},
		({ id, description, icon, ...payload }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await collectionService.updateCollection(
					getAuthenticatedUserId(),
					id,
					{
						...payload,
						description: description ?? null,
						icon: icon ?? null,
					},
					getRequestOrigin()
				);
				return { message: 'Collection updated successfully' };
			})
	);

	server.registerTool(
		'collections.delete',
		{
			description: 'Delete a collection. Its links fall back to the Inbox.',
			inputSchema: { id: z.number().int().positive() },
		},
		({ id }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await collectionService.deleteCollection(
					getAuthenticatedUserId(),
					id,
					getRequestOrigin()
				);
				return { message: 'Collection deleted successfully' };
			})
	);

	server.registerTool(
		'collections.follow',
		{
			description: 'Follow another user’s public collection.',
			inputSchema: { collectionId: z.number().int().positive() },
		},
		({ collectionId }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await collectionFollowerService.followCollection(
					collectionId,
					getAuthenticatedUserId(),
					getRequestOrigin()
				);
				return { message: 'Collection followed successfully' };
			})
	);

	server.registerTool(
		'collections.unfollow',
		{
			description: 'Unfollow a public collection.',
			inputSchema: { collectionId: z.number().int().positive() },
		},
		({ collectionId }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await collectionFollowerService.unfollowCollection(
					collectionId,
					getAuthenticatedUserId(),
					getRequestOrigin()
				);
				return { message: 'Collection unfollowed successfully' };
			})
	);
}
