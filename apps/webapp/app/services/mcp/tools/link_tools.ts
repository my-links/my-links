import { z } from 'zod';
import { errors } from '@vinejs/vine';
import { HttpContext } from '@adonisjs/core/http';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type Link from '#models/link';
import LinkTransformer from '#transformers/link';
import { MAXIMUM_URL_LENGTH } from '#constants/link';
import { TOKEN_ABILITY } from '#constants/api_token';
import { runTool } from '#services/mcp/tools/tool_result';
import { resolveRequestOrigin } from '#lib/request_origin';
import { LinkService } from '#services/links/link_service';
import { LinkQueryService } from '#services/links/link_query_service';
import { linkUrlValidator } from '#validators/links/link_url_validator';
import { mcpIdSchema, mcpIdListSchema } from '#services/mcp/tools/id_schema';
import { CollectionLinkService } from '#services/collections/collection_link_service';
import { InvalidLinkUrlException } from '#exceptions/links/invalid_link_url_exception';

/**
 * Runs the URL through the exact rule the REST validators use, so a scheme
 * such as `javascript:` or `file:` never gets stored through MCP.
 */
async function normalizeLinkUrl(url: string): Promise<string> {
	try {
		const { url: normalizedUrl } = await linkUrlValidator.validate({ url });
		return normalizedUrl;
	} catch (error) {
		if (error instanceof errors.E_VALIDATION_ERROR) {
			throw new InvalidLinkUrlException(
				`Invalid url: ${error.messages[0]?.message ?? 'the url is not valid'}`
			);
		}
		throw error;
	}
}

function getAuthenticatedUserId() {
	return HttpContext.getOrFail().auth.getUserOrFail().id;
}

function getRequestOrigin() {
	return resolveRequestOrigin(HttpContext.getOrFail());
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
	linkQueryService: LinkQueryService,
	collectionLinkService: CollectionLinkService
): void {
	server.registerTool(
		'links.list',
		{ description: "List every link in the authenticated user's account." },
		() =>
			runTool(TOKEN_ABILITY.READ, async () =>
				serializeLink(
					await linkQueryService.getMyLinks(getAuthenticatedUserId())
				)
			)
	);

	server.registerTool(
		'links.get',
		{
			description: 'Get a single link by id.',
			inputSchema: { id: mcpIdSchema },
		},
		({ id }) =>
			runTool(TOKEN_ABILITY.READ, async () =>
				serializeLink(
					await linkQueryService.getLinkById(id, getAuthenticatedUserId())
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
			runTool(TOKEN_ABILITY.READ, async () =>
				serializeLink(
					await linkQueryService.searchLinks(getAuthenticatedUserId(), term)
				)
			)
	);

	server.registerTool(
		'links.list_favorites',
		{ description: "List the authenticated user's favorite links." },
		() =>
			runTool(TOKEN_ABILITY.READ, async () =>
				serializeLink(
					await linkQueryService.getMyFavoriteLinks(getAuthenticatedUserId())
				)
			)
	);

	server.registerTool(
		'links.create',
		{
			description: 'Create a new link, optionally filing it into collections.',
			inputSchema: {
				name: z.string().trim().min(1).max(254),
				description: z.string().trim().max(300).optional(),
				url: z.string().trim().min(1).max(MAXIMUM_URL_LENGTH),
				favorite: z.boolean(),
				collectionIds: mcpIdListSchema
					.optional()
					.describe('Defaults to the Inbox collection when omitted or empty.'),
			},
		},
		({ url, ...payload }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				const link = await linkService.createLink(
					getAuthenticatedUserId(),
					{ ...payload, url: await normalizeLinkUrl(url) },
					getRequestOrigin()
				);
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
				id: mcpIdSchema,
				name: z.string().trim().min(1).max(254),
				description: z.string().trim().max(300).optional(),
				url: z.string().trim().min(1).max(MAXIMUM_URL_LENGTH),
				favorite: z.boolean(),
				collectionIds: mcpIdListSchema
					.optional()
					.describe(
						'Omit to leave the current collection membership untouched.'
					),
			},
		},
		({ id, url, ...payload }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await linkService.updateLink(
					getAuthenticatedUserId(),
					id,
					{ ...payload, url: await normalizeLinkUrl(url) },
					getRequestOrigin()
				);
				return { message: 'Link updated successfully' };
			})
	);

	server.registerTool(
		'links.delete',
		{
			description: 'Delete a link.',
			inputSchema: { id: mcpIdSchema },
		},
		({ id }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await linkService.deleteLink(
					getAuthenticatedUserId(),
					id,
					getRequestOrigin()
				);
				return { message: 'Link deleted successfully' };
			})
	);

	server.registerTool(
		'links.toggle_favorite',
		{
			description: 'Set whether a link is marked as favorite.',
			inputSchema: { id: mcpIdSchema, favorite: z.boolean() },
		},
		({ id, favorite }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await linkService.updateFavorite(
					getAuthenticatedUserId(),
					id,
					favorite,
					getRequestOrigin()
				);
				return { message: 'Link favorite updated successfully', favorite };
			})
	);

	server.registerTool(
		'links.move_to_collection',
		{
			description:
				'Move a link from one of the owner’s collections to another.',
			inputSchema: {
				linkId: mcpIdSchema,
				fromCollectionId: mcpIdSchema,
				toCollectionId: mcpIdSchema,
			},
		},
		({ linkId, fromCollectionId, toCollectionId }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await collectionLinkService.moveLinkBetweenCollections(
					getAuthenticatedUserId(),
					linkId,
					fromCollectionId,
					toCollectionId,
					getRequestOrigin()
				);
				return { message: 'Link moved successfully' };
			})
	);

	server.registerTool(
		'links.add_to_collection',
		{
			description: 'Add a link to one more of the owner’s collections.',
			inputSchema: {
				linkId: mcpIdSchema,
				collectionId: mcpIdSchema,
			},
		},
		({ linkId, collectionId }) =>
			runTool(TOKEN_ABILITY.WRITE, async () => {
				await collectionLinkService.addLinkToCollection(
					getAuthenticatedUserId(),
					linkId,
					collectionId,
					getRequestOrigin()
				);
				return { message: 'Link added to collection successfully' };
			})
	);
}
