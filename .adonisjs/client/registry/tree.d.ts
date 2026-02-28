/* eslint-disable prettier/prettier */
import type { routes } from './index.ts';

export interface ApiDefinition {
	home: (typeof routes)['home'];
	terms: (typeof routes)['terms'];
	privacy: (typeof routes)['privacy'];
	apiHealth: {
		index: (typeof routes)['api-health.index'];
	};
	shared: (typeof routes)['shared'];
	favicon: (typeof routes)['favicon'];
	auth: (typeof routes)['auth'] & {
		callback: (typeof routes)['auth.callback'];
		logout: (typeof routes)['auth.logout'];
	};
	admin: {
		dashboard: (typeof routes)['admin.dashboard'];
		status: (typeof routes)['admin.status'];
	};
	apiCollections: {
		index: (typeof routes)['api-collections.index'];
		create: (typeof routes)['api-collections.create'];
		update: (typeof routes)['api-collections.update'];
		delete: (typeof routes)['api-collections.delete'];
	};
	apiFavorites: {
		index: (typeof routes)['api-favorites.index'];
	};
	apiLinks: {
		create: (typeof routes)['api-links.create'];
		update: (typeof routes)['api-links.update'];
		delete: (typeof routes)['api-links.delete'];
	};
	apiTokens: {
		index: (typeof routes)['api-tokens.index'];
	};
	collection: {
		create: (typeof routes)['collection.create'];
		favorites: (typeof routes)['collection.favorites'];
		show: (typeof routes)['collection.show'];
		edit: (typeof routes)['collection.edit'];
		delete: (typeof routes)['collection.delete'];
		follow: (typeof routes)['collection.follow'];
		unfollow: (typeof routes)['collection.unfollow'];
	};
	link: {
		create: (typeof routes)['link.create'];
		edit: (typeof routes)['link.edit'];
		toggleFavorite: (typeof routes)['link.toggle-favorite'];
		delete: (typeof routes)['link.delete'];
	};
	search: (typeof routes)['search'];
	user: {
		apiTokens: {
			store: (typeof routes)['user.api-tokens.store'];
			destroy: (typeof routes)['user.api-tokens.destroy'];
		};
		settings: (typeof routes)['user.settings'] & {
			export: (typeof routes)['user.settings.export'];
			import: (typeof routes)['user.settings.import'];
			delete: (typeof routes)['user.settings.delete'];
		};
	};
}
