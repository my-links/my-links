/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type {
	ExtractBody,
	ExtractQuery,
	ExtractQueryForGet,
	ExtractResponse,
} from '@tuyau/core/types';
import type { InferInput } from '@vinejs/vine/types';

export type ParamValue = string | number | bigint | boolean;

export interface Registry {
	home: {
		methods: ['GET', 'HEAD'];
		pattern: '/';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: unknown;
		};
	};
	terms: {
		methods: ['GET', 'HEAD'];
		pattern: '/terms';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: unknown;
		};
	};
	privacy: {
		methods: ['GET', 'HEAD'];
		pattern: '/privacy';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: unknown;
		};
	};
	'api-health.index': {
		methods: ['GET', 'HEAD'];
		pattern: '/api/v1/health';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/health/health_controller').default['render']
					>
				>
			>;
		};
	};
	shared: {
		methods: ['GET', 'HEAD'];
		pattern: '/shared/:id';
		types: {
			body: {};
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQueryForGet<
				InferInput<
					typeof import('#validators/shared_collections/shared_collection').getSharedCollectionValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/shared_collections/shared_collections_controller').default['render']
					>
				>
			>;
		};
	};
	favicon: {
		methods: ['GET', 'HEAD'];
		pattern: '/favicon';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/favicons/favicons_controller').default['render']
					>
				>
			>;
		};
	};
	auth: {
		methods: ['GET', 'HEAD'];
		pattern: '/auth/google';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/auth/auth_controller').default['google']
					>
				>
			>;
		};
	};
	'auth.callback': {
		methods: ['GET', 'HEAD'];
		pattern: '/auth/callback';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/auth/auth_controller').default['callbackAuth']
					>
				>
			>;
		};
	};
	'auth.logout': {
		methods: ['GET', 'HEAD'];
		pattern: '/auth/logout';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/auth/auth_controller').default['logout']
					>
				>
			>;
		};
	};
	'admin.dashboard': {
		methods: ['GET', 'HEAD'];
		pattern: '/admin';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/admin/admin_controller').default['render']
					>
				>
			>;
		};
	};
	'admin.status': {
		methods: ['GET', 'HEAD'];
		pattern: '/admin/status';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/admin/status_controller').default['render']
					>
				>
			>;
		};
	};
	'api-collections.index': {
		methods: ['GET', 'HEAD'];
		pattern: '/api/v1/collections';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/collections/get_collections_controller').default['render']
					>
				>
			>;
		};
	};
	'api-collections.create': {
		methods: ['POST'];
		pattern: '/api/v1/collections';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/collections/create_collection_validator').createCollectionValidator
				>
			>;
			paramsTuple: [];
			params: {};
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/collections/create_collection_validator').createCollectionValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/collections/create_collection_controller').default['execute']
					>
				>
			>;
		};
	};
	'api-collections.update': {
		methods: ['PUT'];
		pattern: '/api/v1/collections/:id';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/collections/update_collection_validator').updateCollectionValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/collections/update_collection_validator').updateCollectionValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/collections/update_collection_controller').default['execute']
					>
				>
			>;
		};
	};
	'api-collections.delete': {
		methods: ['DELETE'];
		pattern: '/api/v1/collections/:id';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/collections/delete_collection_validator').deleteCollectionValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/collections/delete_collection_validator').deleteCollectionValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/collections/delete_collection_controller').default['execute']
					>
				>
			>;
		};
	};
	'api-favorites.index': {
		methods: ['GET', 'HEAD'];
		pattern: '/api/v1/links/favorites';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/links/get_favorite_links_controller').default['render']
					>
				>
			>;
		};
	};
	'api-links.create': {
		methods: ['POST'];
		pattern: '/api/v1/links';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/links/create_link_controller').default['execute']
					>
				>
			>;
		};
	};
	'api-links.update': {
		methods: ['PUT'];
		pattern: '/api/v1/links/:id';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/links/update_link_validator').updateLinkValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/links/update_link_validator').updateLinkValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/links/update_link_controller').default['execute']
					>
				>
			>;
		};
	};
	'api-links.delete': {
		methods: ['DELETE'];
		pattern: '/api/v1/links/:id';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/links/delete_link_validator').deleteLinkValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/links/delete_link_validator').deleteLinkValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/links/delete_link_controller').default['execute']
					>
				>
			>;
		};
	};
	'api-tokens.index': {
		methods: ['GET', 'HEAD'];
		pattern: '/api/v1/tokens/check';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/api/tokens/api_token_controller').default['render']
					>
				>
			>;
		};
	};
	'collection.create': {
		methods: ['POST'];
		pattern: '/collections';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/collections/create_collection_validator').createCollectionValidator
				>
			>;
			paramsTuple: [];
			params: {};
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/collections/create_collection_validator').createCollectionValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/collections/create_collection_controller').default['execute']
					>
				>
			>;
		};
	};
	'collection.favorites': {
		methods: ['GET', 'HEAD'];
		pattern: '/collections/favorites';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/favorites/show_favorites_controller').default['render']
					>
				>
			>;
		};
	};
	'collection.show': {
		methods: ['GET', 'HEAD'];
		pattern: '/collections/:id';
		types: {
			body: {};
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/collections/show_collection_controller').default['render']
					>
				>
			>;
		};
	};
	'collection.edit': {
		methods: ['PUT'];
		pattern: '/collections/:id';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/collections/update_collection_validator').updateCollectionValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/collections/update_collection_validator').updateCollectionValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/collections/update_collection_controller').default['execute']
					>
				>
			>;
		};
	};
	'collection.delete': {
		methods: ['DELETE'];
		pattern: '/collections/:id';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/collections/delete_collection_validator').deleteCollectionValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/collections/delete_collection_validator').deleteCollectionValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/collections/delete_collection_controller').default['execute']
					>
				>
			>;
		};
	};
	'collection.follow': {
		methods: ['POST'];
		pattern: '/collections/:id/follow';
		types: {
			body: {};
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/collections/follow_collection_controller').default['execute']
					>
				>
			>;
		};
	};
	'collection.unfollow': {
		methods: ['POST'];
		pattern: '/collections/:id/unfollow';
		types: {
			body: {};
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/collections/unfollow_collection_controller').default['execute']
					>
				>
			>;
		};
	};
	'link.create': {
		methods: ['POST'];
		pattern: '/links';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/links/create_link_validator').createLinkValidator
				>
			>;
			paramsTuple: [];
			params: {};
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/links/create_link_validator').createLinkValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/links/create_link_controller').default['execute']
					>
				>
			>;
		};
	};
	'link.edit': {
		methods: ['PUT'];
		pattern: '/links/:id';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/links/update_link_validator').updateLinkValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/links/update_link_validator').updateLinkValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/links/update_link_controller').default['execute']
					>
				>
			>;
		};
	};
	'link.toggle-favorite': {
		methods: ['PUT'];
		pattern: '/links/:id/favorite';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/links/update_favorite_link_validator').updateLinkFavoriteStatusValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/links/update_favorite_link_validator').updateLinkFavoriteStatusValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/links/toggle_favorite_controller').default['execute']
					>
				>
			>;
		};
	};
	'link.delete': {
		methods: ['DELETE'];
		pattern: '/links/:id';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/links/delete_link_validator').deleteLinkValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/links/delete_link_validator').deleteLinkValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/links/delete_link_controller').default['execute']
					>
				>
			>;
		};
	};
	search: {
		methods: ['GET', 'HEAD'];
		pattern: '/search';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: ExtractQueryForGet<
				InferInput<
					typeof import('#validators/search/search_validator').searchValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/search/search_controller').default['render']
					>
				>
			>;
		};
	};
	'user.api-tokens.store': {
		methods: ['POST'];
		pattern: '/user/api-tokens';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/user/token/create_api_token').createApiTokenValidator
				>
			>;
			paramsTuple: [];
			params: {};
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/user/token/create_api_token').createApiTokenValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/user/api_token_controller').default['store']
					>
				>
			>;
		};
	};
	'user.api-tokens.destroy': {
		methods: ['DELETE'];
		pattern: '/user/api-tokens/:tokenId';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/user/token/delete_api_token').deleteApiTokenValidator
				>
			>;
			paramsTuple: [ParamValue];
			params: { tokenId: ParamValue };
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/user/token/delete_api_token').deleteApiTokenValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/user/api_token_controller').default['destroy']
					>
				>
			>;
		};
	};
	'user.settings': {
		methods: ['GET', 'HEAD'];
		pattern: '/user/settings';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/user_settings/show_user_settings_controller').default['render']
					>
				>
			>;
		};
	};
	'user.settings.export': {
		methods: ['GET', 'HEAD'];
		pattern: '/user/settings/export';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/user_settings/export_user_data_controller').default['execute']
					>
				>
			>;
		};
	};
	'user.settings.import': {
		methods: ['POST'];
		pattern: '/user/settings/import';
		types: {
			body: ExtractBody<
				InferInput<
					typeof import('#validators/user_settings/import_data_validator').importDataValidator
				>
			>;
			paramsTuple: [];
			params: {};
			query: ExtractQuery<
				InferInput<
					typeof import('#validators/user_settings/import_data_validator').importDataValidator
				>
			>;
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/user_settings/import_user_data_controller').default['execute']
					>
				>
			>;
		};
	};
	'user.settings.delete': {
		methods: ['DELETE'];
		pattern: '/user/settings/account';
		types: {
			body: {};
			paramsTuple: [];
			params: {};
			query: {};
			response: ExtractResponse<
				Awaited<
					ReturnType<
						import('#controllers/user_settings/delete_user_account_controller').default['execute']
					>
				>
			>;
		};
	};
}
