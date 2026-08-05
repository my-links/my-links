import { defineConfig } from '@outloud/adonis-openapi';
import type { Handler } from '@outloud/adonis-openapi-generator';

import env from '#start/env';
import packageJson from '../package.json' with { type: 'json' };

/**
 * `BaseTransformer.transform(...)` returns a `Collection<Transformer, MaxDepth,
 * Variant>` or `Item<Transformer, MaxDepth, Variant>` (from
 * `@adonisjs/http-transformers`) — a lazy builder that AdonisJS's response
 * layer resolves into plain JSON at request time. Statically, ts-morph only
 * sees the builder's own internal shape (`#private`, `transformerData`,
 * `variant`, ...), which isn't valid JSON Schema and crashes downstream
 * codegen. This teaches the generator to resolve the *actual* variant
 * method's return type instead, the same way it already does for objects
 * exposing `toJSON`/`toOpenAPI` (see `objectToSchema` upstream).
 */
// `Paginator` wraps a Collection-like array plus pagination metadata; none
// of our current routes use `.paginate()`, so it's treated like `Collection`
// (array of the resolved item) rather than modelling the metadata envelope.
const ARRAY_LIKE_RESOURCE_CLASS_NAMES = new Set(['Collection', 'Paginator']);
const TRANSFORMER_RESOURCE_CLASS_NAMES = new Set([
	'Item',
	...ARRAY_LIKE_RESOURCE_CLASS_NAMES,
]);

const transformerResourceHandler: Handler = {
	test: (type) => {
		const name = type.getSymbol()?.getName();
		return !!name && TRANSFORMER_RESOURCE_CLASS_NAMES.has(name);
	},
	schema: async (type, context) => {
		const [transformerType, , variantType] = type.getTypeArguments();
		const variantLiteral = variantType?.isStringLiteral()
			? variantType.getLiteralValue()
			: undefined;
		const variantName =
			typeof variantLiteral === 'string' ? variantLiteral : 'toObject';
		const variantSymbol = transformerType?.getProperty(variantName);

		const itemSchema = variantSymbol
			? await context.jsonToSchema(variantSymbol)
			: {};

		const resourceName = type.getSymbol()?.getName();
		const isArrayLike =
			!!resourceName && ARRAY_LIKE_RESOURCE_CLASS_NAMES.has(resourceName);
		return isArrayLike ? { type: 'array', items: itemSchema } : itemSchema;
	},
};

const openapiConfig = defineConfig({
	enabled: true,
	provider: 'scalar',
	document: {
		info: {
			title: env.get('APP_DISPLAY_NAME', packageJson.name),
			version: packageJson.version,
		},
		servers: [
			{ url: env.get('APP_URL', 'http://localhost:' + env.get('PORT')) },
		],
	},
	generator: {
		resolve: (specifier, parent) => import.meta.resolve(specifier, parent),
		// Scoped to the token-guarded JSON surface — the webapp's own
		// Inertia routes render pages/redirects, not JSON, and don't belong
		// in a client-facing API document (the generator also can't infer a
		// real response type for those). Matched against the raw route
		// pattern (`:id`, not `{id}`) with exact string equality — no glob
		// support, so this must be kept in sync by hand when a new
		// `/api/v1/*` or `/extension/*` route is added.
		routes: {
			include: [
				'/api/v1/collections',
				'/api/v1/collections/:id',
				'/api/v1/collections/owned/reorder',
				'/api/v1/collections/followed/reorder',
				'/api/v1/collections/:id/links/reorder',
				'/api/v1/links/favorites',
				'/api/v1/health',
				'/api/v1/links',
				'/api/v1/links/:id',
				'/api/v1/links/:id/collection',
				'/api/v1/links/:id/collections',
				'/api/v1/search',
				'/api/v1/sync',
				'/api/v1/tokens/check',
				'/extension/authorize',
			],
		},
		handlers: [transformerResourceHandler],
	},
});

export default openapiConfig;
