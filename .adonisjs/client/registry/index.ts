/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types';
import type { Registry } from './schema.d.ts';
import type { ApiDefinition } from './tree.d.ts';

const placeholder: any = {};

const routes = {
	home: {
		methods: ['GET', 'HEAD'],
		pattern: '/',
		tokens: [{ old: '/', type: 0, val: '/', end: '' }],
		types: placeholder as Registry['home']['types'],
	},
	terms: {
		methods: ['GET', 'HEAD'],
		pattern: '/terms',
		tokens: [{ old: '/terms', type: 0, val: 'terms', end: '' }],
		types: placeholder as Registry['terms']['types'],
	},
	privacy: {
		methods: ['GET', 'HEAD'],
		pattern: '/privacy',
		tokens: [{ old: '/privacy', type: 0, val: 'privacy', end: '' }],
		types: placeholder as Registry['privacy']['types'],
	},
	'api-health.index': {
		methods: ['GET', 'HEAD'],
		pattern: '/api/v1/health',
		tokens: [
			{ old: '/api/v1/health', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/health', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/health', type: 0, val: 'health', end: '' },
		],
		types: placeholder as Registry['api-health.index']['types'],
	},
	shared: {
		methods: ['GET', 'HEAD'],
		pattern: '/shared/:id',
		tokens: [
			{ old: '/shared/:id', type: 0, val: 'shared', end: '' },
			{ old: '/shared/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['shared']['types'],
	},
	favicon: {
		methods: ['GET', 'HEAD'],
		pattern: '/favicon',
		tokens: [{ old: '/favicon', type: 0, val: 'favicon', end: '' }],
		types: placeholder as Registry['favicon']['types'],
	},
	auth: {
		methods: ['GET', 'HEAD'],
		pattern: '/auth/google',
		tokens: [
			{ old: '/auth/google', type: 0, val: 'auth', end: '' },
			{ old: '/auth/google', type: 0, val: 'google', end: '' },
		],
		types: placeholder as Registry['auth']['types'],
	},
	'auth.callback': {
		methods: ['GET', 'HEAD'],
		pattern: '/auth/callback',
		tokens: [
			{ old: '/auth/callback', type: 0, val: 'auth', end: '' },
			{ old: '/auth/callback', type: 0, val: 'callback', end: '' },
		],
		types: placeholder as Registry['auth.callback']['types'],
	},
	'auth.logout': {
		methods: ['GET', 'HEAD'],
		pattern: '/auth/logout',
		tokens: [
			{ old: '/auth/logout', type: 0, val: 'auth', end: '' },
			{ old: '/auth/logout', type: 0, val: 'logout', end: '' },
		],
		types: placeholder as Registry['auth.logout']['types'],
	},
	'admin.dashboard': {
		methods: ['GET', 'HEAD'],
		pattern: '/admin',
		tokens: [{ old: '/admin', type: 0, val: 'admin', end: '' }],
		types: placeholder as Registry['admin.dashboard']['types'],
	},
	'admin.status': {
		methods: ['GET', 'HEAD'],
		pattern: '/admin/status',
		tokens: [
			{ old: '/admin/status', type: 0, val: 'admin', end: '' },
			{ old: '/admin/status', type: 0, val: 'status', end: '' },
		],
		types: placeholder as Registry['admin.status']['types'],
	},
	'api-collections.index': {
		methods: ['GET', 'HEAD'],
		pattern: '/api/v1/collections',
		tokens: [
			{ old: '/api/v1/collections', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/collections', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/collections', type: 0, val: 'collections', end: '' },
		],
		types: placeholder as Registry['api-collections.index']['types'],
	},
	'api-collections.create': {
		methods: ['POST'],
		pattern: '/api/v1/collections',
		tokens: [
			{ old: '/api/v1/collections', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/collections', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/collections', type: 0, val: 'collections', end: '' },
		],
		types: placeholder as Registry['api-collections.create']['types'],
	},
	'api-collections.update': {
		methods: ['PUT'],
		pattern: '/api/v1/collections/:id',
		tokens: [
			{ old: '/api/v1/collections/:id', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/collections/:id', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/collections/:id', type: 0, val: 'collections', end: '' },
			{ old: '/api/v1/collections/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['api-collections.update']['types'],
	},
	'api-collections.delete': {
		methods: ['DELETE'],
		pattern: '/api/v1/collections/:id',
		tokens: [
			{ old: '/api/v1/collections/:id', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/collections/:id', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/collections/:id', type: 0, val: 'collections', end: '' },
			{ old: '/api/v1/collections/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['api-collections.delete']['types'],
	},
	'api-favorites.index': {
		methods: ['GET', 'HEAD'],
		pattern: '/api/v1/links/favorites',
		tokens: [
			{ old: '/api/v1/links/favorites', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/links/favorites', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/links/favorites', type: 0, val: 'links', end: '' },
			{ old: '/api/v1/links/favorites', type: 0, val: 'favorites', end: '' },
		],
		types: placeholder as Registry['api-favorites.index']['types'],
	},
	'api-links.create': {
		methods: ['POST'],
		pattern: '/api/v1/links',
		tokens: [
			{ old: '/api/v1/links', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/links', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/links', type: 0, val: 'links', end: '' },
		],
		types: placeholder as Registry['api-links.create']['types'],
	},
	'api-links.update': {
		methods: ['PUT'],
		pattern: '/api/v1/links/:id',
		tokens: [
			{ old: '/api/v1/links/:id', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/links/:id', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/links/:id', type: 0, val: 'links', end: '' },
			{ old: '/api/v1/links/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['api-links.update']['types'],
	},
	'api-links.delete': {
		methods: ['DELETE'],
		pattern: '/api/v1/links/:id',
		tokens: [
			{ old: '/api/v1/links/:id', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/links/:id', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/links/:id', type: 0, val: 'links', end: '' },
			{ old: '/api/v1/links/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['api-links.delete']['types'],
	},
	'api-tokens.index': {
		methods: ['GET', 'HEAD'],
		pattern: '/api/v1/tokens/check',
		tokens: [
			{ old: '/api/v1/tokens/check', type: 0, val: 'api', end: '' },
			{ old: '/api/v1/tokens/check', type: 0, val: 'v1', end: '' },
			{ old: '/api/v1/tokens/check', type: 0, val: 'tokens', end: '' },
			{ old: '/api/v1/tokens/check', type: 0, val: 'check', end: '' },
		],
		types: placeholder as Registry['api-tokens.index']['types'],
	},
	'collection.create': {
		methods: ['POST'],
		pattern: '/collections',
		tokens: [{ old: '/collections', type: 0, val: 'collections', end: '' }],
		types: placeholder as Registry['collection.create']['types'],
	},
	'collection.favorites': {
		methods: ['GET', 'HEAD'],
		pattern: '/collections/favorites',
		tokens: [
			{ old: '/collections/favorites', type: 0, val: 'collections', end: '' },
			{ old: '/collections/favorites', type: 0, val: 'favorites', end: '' },
		],
		types: placeholder as Registry['collection.favorites']['types'],
	},
	'collection.show': {
		methods: ['GET', 'HEAD'],
		pattern: '/collections/:id',
		tokens: [
			{ old: '/collections/:id', type: 0, val: 'collections', end: '' },
			{ old: '/collections/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['collection.show']['types'],
	},
	'collection.edit': {
		methods: ['PUT'],
		pattern: '/collections/:id',
		tokens: [
			{ old: '/collections/:id', type: 0, val: 'collections', end: '' },
			{ old: '/collections/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['collection.edit']['types'],
	},
	'collection.delete': {
		methods: ['DELETE'],
		pattern: '/collections/:id',
		tokens: [
			{ old: '/collections/:id', type: 0, val: 'collections', end: '' },
			{ old: '/collections/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['collection.delete']['types'],
	},
	'collection.follow': {
		methods: ['POST'],
		pattern: '/collections/:id/follow',
		tokens: [
			{ old: '/collections/:id/follow', type: 0, val: 'collections', end: '' },
			{ old: '/collections/:id/follow', type: 1, val: 'id', end: '' },
			{ old: '/collections/:id/follow', type: 0, val: 'follow', end: '' },
		],
		types: placeholder as Registry['collection.follow']['types'],
	},
	'collection.unfollow': {
		methods: ['POST'],
		pattern: '/collections/:id/unfollow',
		tokens: [
			{
				old: '/collections/:id/unfollow',
				type: 0,
				val: 'collections',
				end: '',
			},
			{ old: '/collections/:id/unfollow', type: 1, val: 'id', end: '' },
			{ old: '/collections/:id/unfollow', type: 0, val: 'unfollow', end: '' },
		],
		types: placeholder as Registry['collection.unfollow']['types'],
	},
	'link.create': {
		methods: ['POST'],
		pattern: '/links',
		tokens: [{ old: '/links', type: 0, val: 'links', end: '' }],
		types: placeholder as Registry['link.create']['types'],
	},
	'link.edit': {
		methods: ['PUT'],
		pattern: '/links/:id',
		tokens: [
			{ old: '/links/:id', type: 0, val: 'links', end: '' },
			{ old: '/links/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['link.edit']['types'],
	},
	'link.toggle-favorite': {
		methods: ['PUT'],
		pattern: '/links/:id/favorite',
		tokens: [
			{ old: '/links/:id/favorite', type: 0, val: 'links', end: '' },
			{ old: '/links/:id/favorite', type: 1, val: 'id', end: '' },
			{ old: '/links/:id/favorite', type: 0, val: 'favorite', end: '' },
		],
		types: placeholder as Registry['link.toggle-favorite']['types'],
	},
	'link.delete': {
		methods: ['DELETE'],
		pattern: '/links/:id',
		tokens: [
			{ old: '/links/:id', type: 0, val: 'links', end: '' },
			{ old: '/links/:id', type: 1, val: 'id', end: '' },
		],
		types: placeholder as Registry['link.delete']['types'],
	},
	search: {
		methods: ['GET', 'HEAD'],
		pattern: '/search',
		tokens: [{ old: '/search', type: 0, val: 'search', end: '' }],
		types: placeholder as Registry['search']['types'],
	},
	'user.api-tokens.store': {
		methods: ['POST'],
		pattern: '/user/api-tokens',
		tokens: [
			{ old: '/user/api-tokens', type: 0, val: 'user', end: '' },
			{ old: '/user/api-tokens', type: 0, val: 'api-tokens', end: '' },
		],
		types: placeholder as Registry['user.api-tokens.store']['types'],
	},
	'user.api-tokens.destroy': {
		methods: ['DELETE'],
		pattern: '/user/api-tokens/:tokenId',
		tokens: [
			{ old: '/user/api-tokens/:tokenId', type: 0, val: 'user', end: '' },
			{ old: '/user/api-tokens/:tokenId', type: 0, val: 'api-tokens', end: '' },
			{ old: '/user/api-tokens/:tokenId', type: 1, val: 'tokenId', end: '' },
		],
		types: placeholder as Registry['user.api-tokens.destroy']['types'],
	},
	'user.settings': {
		methods: ['GET', 'HEAD'],
		pattern: '/user/settings',
		tokens: [
			{ old: '/user/settings', type: 0, val: 'user', end: '' },
			{ old: '/user/settings', type: 0, val: 'settings', end: '' },
		],
		types: placeholder as Registry['user.settings']['types'],
	},
	'user.settings.export': {
		methods: ['GET', 'HEAD'],
		pattern: '/user/settings/export',
		tokens: [
			{ old: '/user/settings/export', type: 0, val: 'user', end: '' },
			{ old: '/user/settings/export', type: 0, val: 'settings', end: '' },
			{ old: '/user/settings/export', type: 0, val: 'export', end: '' },
		],
		types: placeholder as Registry['user.settings.export']['types'],
	},
	'user.settings.import': {
		methods: ['POST'],
		pattern: '/user/settings/import',
		tokens: [
			{ old: '/user/settings/import', type: 0, val: 'user', end: '' },
			{ old: '/user/settings/import', type: 0, val: 'settings', end: '' },
			{ old: '/user/settings/import', type: 0, val: 'import', end: '' },
		],
		types: placeholder as Registry['user.settings.import']['types'],
	},
	'user.settings.delete': {
		methods: ['DELETE'],
		pattern: '/user/settings/account',
		tokens: [
			{ old: '/user/settings/account', type: 0, val: 'user', end: '' },
			{ old: '/user/settings/account', type: 0, val: 'settings', end: '' },
			{ old: '/user/settings/account', type: 0, val: 'account', end: '' },
		],
		types: placeholder as Registry['user.settings.delete']['types'],
	},
} as const satisfies Record<string, AdonisEndpoint>;

export { routes };

export const registry = {
	routes,
	$tree: {} as ApiDefinition,
};

declare module '@tuyau/core/types' {
	export interface UserRegistry {
		routes: typeof routes;
		$tree: ApiDefinition;
	}
}
