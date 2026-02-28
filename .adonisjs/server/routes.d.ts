import '@adonisjs/core/types/http';

type ParamValue = string | number | bigint | boolean;

export type ScannedRoutes = {
	ALL: {
		home: { paramsTuple?: []; params?: {} };
		terms: { paramsTuple?: []; params?: {} };
		privacy: { paramsTuple?: []; params?: {} };
		'api-health.index': { paramsTuple?: []; params?: {} };
		shared: { paramsTuple: [ParamValue]; params: { id: ParamValue } };
		favicon: { paramsTuple?: []; params?: {} };
		auth: { paramsTuple?: []; params?: {} };
		'auth.callback': { paramsTuple?: []; params?: {} };
		'auth.logout': { paramsTuple?: []; params?: {} };
		'admin.dashboard': { paramsTuple?: []; params?: {} };
		'admin.status': { paramsTuple?: []; params?: {} };
		'api-collections.index': { paramsTuple?: []; params?: {} };
		'api-collections.create': { paramsTuple?: []; params?: {} };
		'api-collections.update': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'api-collections.delete': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'api-favorites.index': { paramsTuple?: []; params?: {} };
		'api-links.create': { paramsTuple?: []; params?: {} };
		'api-links.update': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'api-links.delete': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'api-tokens.index': { paramsTuple?: []; params?: {} };
		'collection.create': { paramsTuple?: []; params?: {} };
		'collection.favorites': { paramsTuple?: []; params?: {} };
		'collection.show': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'collection.edit': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'collection.delete': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'collection.follow': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'collection.unfollow': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'link.create': { paramsTuple?: []; params?: {} };
		'link.edit': { paramsTuple: [ParamValue]; params: { id: ParamValue } };
		'link.toggle-favorite': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'link.delete': { paramsTuple: [ParamValue]; params: { id: ParamValue } };
		search: { paramsTuple?: []; params?: {} };
		'user.api-tokens.store': { paramsTuple?: []; params?: {} };
		'user.api-tokens.destroy': {
			paramsTuple: [ParamValue];
			params: { tokenId: ParamValue };
		};
		'user.settings': { paramsTuple?: []; params?: {} };
		'user.settings.export': { paramsTuple?: []; params?: {} };
		'user.settings.import': { paramsTuple?: []; params?: {} };
		'user.settings.delete': { paramsTuple?: []; params?: {} };
	};
	GET: {
		home: { paramsTuple?: []; params?: {} };
		terms: { paramsTuple?: []; params?: {} };
		privacy: { paramsTuple?: []; params?: {} };
		'api-health.index': { paramsTuple?: []; params?: {} };
		shared: { paramsTuple: [ParamValue]; params: { id: ParamValue } };
		favicon: { paramsTuple?: []; params?: {} };
		auth: { paramsTuple?: []; params?: {} };
		'auth.callback': { paramsTuple?: []; params?: {} };
		'auth.logout': { paramsTuple?: []; params?: {} };
		'admin.dashboard': { paramsTuple?: []; params?: {} };
		'admin.status': { paramsTuple?: []; params?: {} };
		'api-collections.index': { paramsTuple?: []; params?: {} };
		'api-favorites.index': { paramsTuple?: []; params?: {} };
		'api-tokens.index': { paramsTuple?: []; params?: {} };
		'collection.favorites': { paramsTuple?: []; params?: {} };
		'collection.show': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		search: { paramsTuple?: []; params?: {} };
		'user.settings': { paramsTuple?: []; params?: {} };
		'user.settings.export': { paramsTuple?: []; params?: {} };
	};
	HEAD: {
		home: { paramsTuple?: []; params?: {} };
		terms: { paramsTuple?: []; params?: {} };
		privacy: { paramsTuple?: []; params?: {} };
		'api-health.index': { paramsTuple?: []; params?: {} };
		shared: { paramsTuple: [ParamValue]; params: { id: ParamValue } };
		favicon: { paramsTuple?: []; params?: {} };
		auth: { paramsTuple?: []; params?: {} };
		'auth.callback': { paramsTuple?: []; params?: {} };
		'auth.logout': { paramsTuple?: []; params?: {} };
		'admin.dashboard': { paramsTuple?: []; params?: {} };
		'admin.status': { paramsTuple?: []; params?: {} };
		'api-collections.index': { paramsTuple?: []; params?: {} };
		'api-favorites.index': { paramsTuple?: []; params?: {} };
		'api-tokens.index': { paramsTuple?: []; params?: {} };
		'collection.favorites': { paramsTuple?: []; params?: {} };
		'collection.show': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		search: { paramsTuple?: []; params?: {} };
		'user.settings': { paramsTuple?: []; params?: {} };
		'user.settings.export': { paramsTuple?: []; params?: {} };
	};
	POST: {
		'api-collections.create': { paramsTuple?: []; params?: {} };
		'api-links.create': { paramsTuple?: []; params?: {} };
		'collection.create': { paramsTuple?: []; params?: {} };
		'collection.follow': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'collection.unfollow': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'link.create': { paramsTuple?: []; params?: {} };
		'user.api-tokens.store': { paramsTuple?: []; params?: {} };
		'user.settings.import': { paramsTuple?: []; params?: {} };
	};
	PUT: {
		'api-collections.update': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'api-links.update': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'collection.edit': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'link.edit': { paramsTuple: [ParamValue]; params: { id: ParamValue } };
		'link.toggle-favorite': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
	};
	DELETE: {
		'api-collections.delete': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'api-links.delete': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'collection.delete': {
			paramsTuple: [ParamValue];
			params: { id: ParamValue };
		};
		'link.delete': { paramsTuple: [ParamValue]; params: { id: ParamValue } };
		'user.api-tokens.destroy': {
			paramsTuple: [ParamValue];
			params: { tokenId: ParamValue };
		};
		'user.settings.delete': { paramsTuple?: []; params?: {} };
	};
};
declare module '@adonisjs/core/types/http' {
	export interface RoutesList extends ScannedRoutes {}
}
