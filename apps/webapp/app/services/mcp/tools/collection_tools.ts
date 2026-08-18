import { z } from 'zod';
import { HttpContext } from '@adonisjs/core/http';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type Collection from '#models/collection';
import { runTool } from '#services/mcp/tools/tool_result';
import { VISIBILITY } from '#enums/collections/visibility';
import CollectionTransformer from '#transformers/collection';
import { CollectionService } from '#services/collections/collection_service';
import { CollectionFollowerService } from '#services/collections/collection_follower_service';

function getAuthenticatedUserId() {
	return HttpContext.getOrFail().auth.getUserOrFail().id;
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
	collectionFollowerService: CollectionFollowerService
): void {
	server.registerTool(
		'collections.list',
		{
			description:
				'List the authenticated user’s own collections and the public collections they follow.',
		},
		() =>
			runTool(async () => {
				const userId = getAuthenticatedUserId();
				const [owned, followed] = await Promise.all([
					collectionService.getCollectionsForAuthenticatedUser(),
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
			runTool(async () => {
				const { collection } =
					await collectionService.getAccessibleCollectionByIdWithLinks(
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
			runTool(async () => {
				const userId = getAuthenticatedUserId();
				const inbox =
					await collectionService.getOrCreateDefaultCollection(userId);
				const { collection } =
					await collectionService.getAccessibleCollectionByIdWithLinks(
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
			runTool(async () => {
				const collection = await collectionService.createCollection({
					...payload,
					description: description ?? null,
					icon: icon ?? null,
				});
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
			runTool(async () => {
				await collectionService.updateCollection(id, {
					...payload,
					description: description ?? null,
					icon: icon ?? null,
				});
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
			runTool(async () => {
				await collectionService.deleteCollection(id);
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
			runTool(async () => {
				await collectionFollowerService.followCollection(
					collectionId,
					getAuthenticatedUserId()
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
			runTool(async () => {
				await collectionFollowerService.unfollowCollection(
					collectionId,
					getAuthenticatedUserId()
				);
				return { message: 'Collection unfollowed successfully' };
			})
	);
}
