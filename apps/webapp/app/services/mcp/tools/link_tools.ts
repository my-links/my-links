import { z } from 'zod';
import { HttpContext } from '@adonisjs/core/http';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type Link from '#models/link';
import LinkTransformer from '#transformers/link';
import { runTool } from '#services/mcp/tools/tool_result';
import { LinkService } from '#services/links/link_service';
import { CollectionLinkService } from '#services/collections/collection_link_service';

const URL_HAS_SCHEME = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//;

/**
 * Mirrors `baseLinkValidator`'s `normalizeUrl({ defaultProtocol: 'https' })`
 * (a VineJS-only modifier) so a bare domain from an MCP client behaves the
 * same as one submitted through the REST API.
 */
function withDefaultProtocol(url: string): string {
	return URL_HAS_SCHEME.test(url) ? url : `https://${url}`;
}

function getAuthenticatedUserId() {
	return HttpContext.getOrFail().auth.getUserOrFail().id;
}

async function serializeLink(link: Link): Promise<unknown>;
async function serializeLink(links: Link[]): Promise<unknown>;
async function serializeLink(link: Link | Link[]) {
	const { serialize } = HttpContext.getOrFail();
	return Array.isArray(link)
		? serialize.withoutWrapping(
				LinkTransformer.transform(link).useVariant('withCollections')
			)
		: serialize.withoutWrapping(
				LinkTransformer.transform(link).useVariant('withCollections')
			);
}

export function registerLinkTools(
	server: McpServer,
	linkService: LinkService,
	collectionLinkService: CollectionLinkService
): void {
	server.registerTool(
		'links.list',
		{ description: "List every link in the authenticated user's account." },
		() => runTool(async () => serializeLink(await linkService.getMyLinks()))
	);

	server.registerTool(
		'links.get',
		{
			description: 'Get a single link by id.',
			inputSchema: { id: z.number().int().positive() },
		},
		({ id }) =>
			runTool(async () =>
				serializeLink(
					await linkService.getLinkById(id, getAuthenticatedUserId())
				)
			)
	);

	server.registerTool(
		'links.search',
		{
			description:
				'Search the authenticated user’s links by name, URL, or description.',
			inputSchema: { term: z.string().trim().min(1) },
		},
		({ term }) =>
			runTool(async () => serializeLink(await linkService.searchLinks(term)))
	);

	server.registerTool(
		'links.list_favorites',
		{ description: "List the authenticated user's favorite links." },
		() =>
			runTool(async () => serializeLink(await linkService.getMyFavoriteLinks()))
	);

	server.registerTool(
		'links.create',
		{
			description: 'Create a new link, optionally filing it into collections.',
			inputSchema: {
				name: z.string().trim().min(1).max(254),
				description: z.string().trim().max(300).optional(),
				url: z.string().trim().min(1),
				favorite: z.boolean(),
				collectionIds: z
					.array(z.number().int().positive())
					.optional()
					.describe('Defaults to the Inbox collection when omitted or empty.'),
			},
		},
		({ url, ...payload }) =>
			runTool(async () => {
				const link = await linkService.createLink({
					...payload,
					url: withDefaultProtocol(url),
				});
				return {
					message: 'Link created successfully',
					link: await serializeLink(link),
				};
			})
	);

	server.registerTool(
		'links.update',
		{
			description:
				"Update a link's fields and/or the collections it belongs to.",
			inputSchema: {
				id: z.number().int().positive(),
				name: z.string().trim().min(1).max(254),
				description: z.string().trim().max(300).optional(),
				url: z.string().trim().min(1),
				favorite: z.boolean(),
				collectionIds: z
					.array(z.number().int().positive())
					.optional()
					.describe(
						'Omit to leave the current collection membership untouched.'
					),
			},
		},
		({ id, url, ...payload }) =>
			runTool(async () => {
				await linkService.updateLink(id, {
					...payload,
					url: withDefaultProtocol(url),
				});
				return { message: 'Link updated successfully' };
			})
	);

	server.registerTool(
		'links.delete',
		{
			description: 'Delete a link.',
			inputSchema: { id: z.number().int().positive() },
		},
		({ id }) =>
			runTool(async () => {
				await linkService.deleteLink(id);
				return { message: 'Link deleted successfully' };
			})
	);

	server.registerTool(
		'links.toggle_favorite',
		{
			description: 'Set whether a link is marked as favorite.',
			inputSchema: { id: z.number().int().positive(), favorite: z.boolean() },
		},
		({ id, favorite }) =>
			runTool(async () => {
				await linkService.updateFavorite(id, favorite);
				return { message: 'Link favorite updated successfully', favorite };
			})
	);

	server.registerTool(
		'links.move_to_collection',
		{
			description:
				'Move a link from one of the owner’s collections to another.',
			inputSchema: {
				linkId: z.number().int().positive(),
				fromCollectionId: z.number().int().positive(),
				toCollectionId: z.number().int().positive(),
			},
		},
		({ linkId, fromCollectionId, toCollectionId }) =>
			runTool(async () => {
				await collectionLinkService.moveLinkBetweenCollections(
					getAuthenticatedUserId(),
					linkId,
					fromCollectionId,
					toCollectionId
				);
				return { message: 'Link moved successfully' };
			})
	);

	server.registerTool(
		'links.add_to_collection',
		{
			description: 'Add a link to one more of the owner’s collections.',
			inputSchema: {
				linkId: z.number().int().positive(),
				collectionId: z.number().int().positive(),
			},
		},
		({ linkId, collectionId }) =>
			runTool(async () => {
				await collectionLinkService.addLinkToCollection(
					getAuthenticatedUserId(),
					linkId,
					collectionId
				);
				return { message: 'Link added to collection successfully' };
			})
	);
}
