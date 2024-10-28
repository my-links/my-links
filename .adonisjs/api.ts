import type { MakeTuyauRequest, MakeTuyauResponse } from '@tuyau/utils/types';
import type { InferInput } from '@vinejs/vine/types';

type UserThemePost = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/user.ts'))['updateUserThemeValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/apps_controller.ts').default['updateUserTheme']
	>;
};
type FaviconGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/favicons_controller.ts').default['index']
	>;
};
type SharedIdGetHead = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/shared_collection.ts'))['getSharedCollectionValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/shared_collections_controller.ts').default['index']
	>;
};
type AdminGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/admin_controller.ts').default['index']
	>;
};
type AuthLoginGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/users_controller.ts').default['login']
	>;
};
type AuthCallbackGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/users_controller.ts').default['callbackAuth']
	>;
};
type AuthLogoutGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/users_controller.ts').default['logout']
	>;
};
type DashboardGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/collections_controller.ts').default['index']
	>;
};
type CollectionsCreateGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/collections_controller.ts').default['showCreatePage']
	>;
};
type CollectionsPost = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/collection.ts'))['createCollectionValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/collections_controller.ts').default['store']
	>;
};
type CollectionsEditGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/collections_controller.ts').default['showEditPage']
	>;
};
type CollectionsIdPut = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/collection.ts'))['updateCollectionValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/collections_controller.ts').default['update']
	>;
};
type CollectionsDeleteGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/collections_controller.ts').default['showDeletePage']
	>;
};
type CollectionsIdDelete = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/collection.ts'))['deleteCollectionValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/collections_controller.ts').default['delete']
	>;
};
type LinksCreateGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/links_controller.ts').default['showCreatePage']
	>;
};
type LinksPost = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/link.ts'))['createLinkValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/links_controller.ts').default['store']
	>;
};
type LinksEditGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/links_controller.ts').default['showEditPage']
	>;
};
type LinksIdPut = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/link.ts'))['updateLinkValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/links_controller.ts').default['update']
	>;
};
type LinksIdFavoritePut = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/link.ts'))['updateLinkFavoriteStatusValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/links_controller.ts').default['toggleFavorite']
	>;
};
type LinksDeleteGetHead = {
	request: unknown;
	response: MakeTuyauResponse<
		import('../app/controllers/links_controller.ts').default['showDeletePage']
	>;
};
type LinksIdDelete = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/link.ts'))['deleteLinkValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/links_controller.ts').default['delete']
	>;
};
type SearchGetHead = {
	request: MakeTuyauRequest<
		InferInput<
			(typeof import('../app/validators/search_term.ts'))['searchTermValidator']
		>
	>;
	response: MakeTuyauResponse<
		import('../app/controllers/searches_controller.ts').default['search']
	>;
};
export interface ApiDefinition {
	user: {
		theme: {
			$url: {};
			$post: UserThemePost;
		};
	};
	favicon: {
		$url: {};
		$get: FaviconGetHead;
		$head: FaviconGetHead;
	};
	shared: {
		':id': {
			$url: {};
			$get: SharedIdGetHead;
			$head: SharedIdGetHead;
		};
	};
	admin: {
		$url: {};
		$get: AdminGetHead;
		$head: AdminGetHead;
	};
	auth: {
		login: {
			$url: {};
			$get: AuthLoginGetHead;
			$head: AuthLoginGetHead;
		};
		callback: {
			$url: {};
			$get: AuthCallbackGetHead;
			$head: AuthCallbackGetHead;
		};
		logout: {
			$url: {};
			$get: AuthLogoutGetHead;
			$head: AuthLogoutGetHead;
		};
	};
	dashboard: {
		$url: {};
		$get: DashboardGetHead;
		$head: DashboardGetHead;
	};
	collections: {
		create: {
			$url: {};
			$get: CollectionsCreateGetHead;
			$head: CollectionsCreateGetHead;
		};
		$url: {};
		$post: CollectionsPost;
		edit: {
			$url: {};
			$get: CollectionsEditGetHead;
			$head: CollectionsEditGetHead;
		};
		':id': {
			$url: {};
			$put: CollectionsIdPut;
			$delete: CollectionsIdDelete;
		};
		delete: {
			$url: {};
			$get: CollectionsDeleteGetHead;
			$head: CollectionsDeleteGetHead;
		};
	};
	links: {
		create: {
			$url: {};
			$get: LinksCreateGetHead;
			$head: LinksCreateGetHead;
		};
		$url: {};
		$post: LinksPost;
		edit: {
			$url: {};
			$get: LinksEditGetHead;
			$head: LinksEditGetHead;
		};
		':id': {
			$url: {};
			$put: LinksIdPut;
			favorite: {
				$url: {};
				$put: LinksIdFavoritePut;
			};
			$delete: LinksIdDelete;
		};
		delete: {
			$url: {};
			$get: LinksDeleteGetHead;
			$head: LinksDeleteGetHead;
		};
	};
	search: {
		$url: {};
		$get: SearchGetHead;
		$head: SearchGetHead;
	};
}
const routes = [
	{
		params: [],
		name: 'home',
		path: '/',
		method: ['GET', 'HEAD'],
		types: {} as unknown,
	},
	{
		params: [],
		name: 'terms',
		path: '/terms',
		method: ['GET', 'HEAD'],
		types: {} as unknown,
	},
	{
		params: [],
		name: 'privacy',
		path: '/privacy',
		method: ['GET', 'HEAD'],
		types: {} as unknown,
	},
	{
		params: [],
		name: 'user.theme',
		path: '/user/theme',
		method: ['POST'],
		types: {} as UserThemePost,
	},
	{
		params: [],
		name: 'favicon',
		path: '/favicon',
		method: ['GET', 'HEAD'],
		types: {} as FaviconGetHead,
	},
	{
		params: ['id'],
		name: 'shared',
		path: '/shared/:id',
		method: ['GET', 'HEAD'],
		types: {} as SharedIdGetHead,
	},
	{
		params: [],
		name: 'admin.dashboard',
		path: '/admin',
		method: ['GET', 'HEAD'],
		types: {} as AdminGetHead,
	},
	{
		params: [],
		name: 'auth.login',
		path: '/auth/login',
		method: ['GET', 'HEAD'],
		types: {} as AuthLoginGetHead,
	},
	{
		params: [],
		name: 'auth.google',
		path: '/auth/google',
		method: ['GET', 'HEAD'],
		types: {} as unknown,
	},
	{
		params: [],
		name: 'auth.callback',
		path: '/auth/callback',
		method: ['GET', 'HEAD'],
		types: {} as AuthCallbackGetHead,
	},
	{
		params: [],
		name: 'auth.logout',
		path: '/auth/logout',
		method: ['GET', 'HEAD'],
		types: {} as AuthLogoutGetHead,
	},
	{
		params: [],
		name: 'dashboard',
		path: '/dashboard',
		method: ['GET', 'HEAD'],
		types: {} as DashboardGetHead,
	},
	{
		params: [],
		name: 'collection.create-form',
		path: '/collections/create',
		method: ['GET', 'HEAD'],
		types: {} as CollectionsCreateGetHead,
	},
	{
		params: [],
		name: 'collection.create',
		path: '/collections',
		method: ['POST'],
		types: {} as CollectionsPost,
	},
	{
		params: [],
		name: 'collection.edit-form',
		path: '/collections/edit',
		method: ['GET', 'HEAD'],
		types: {} as CollectionsEditGetHead,
	},
	{
		params: ['id'],
		name: 'collection.edit',
		path: '/collections/:id',
		method: ['PUT'],
		types: {} as CollectionsIdPut,
	},
	{
		params: [],
		name: 'collection.delete-form',
		path: '/collections/delete',
		method: ['GET', 'HEAD'],
		types: {} as CollectionsDeleteGetHead,
	},
	{
		params: ['id'],
		name: 'collection.delete',
		path: '/collections/:id',
		method: ['DELETE'],
		types: {} as CollectionsIdDelete,
	},
	{
		params: [],
		name: 'link.create-form',
		path: '/links/create',
		method: ['GET', 'HEAD'],
		types: {} as LinksCreateGetHead,
	},
	{
		params: [],
		name: 'link.create',
		path: '/links',
		method: ['POST'],
		types: {} as LinksPost,
	},
	{
		params: [],
		name: 'link.edit-form',
		path: '/links/edit',
		method: ['GET', 'HEAD'],
		types: {} as LinksEditGetHead,
	},
	{
		params: ['id'],
		name: 'link.edit',
		path: '/links/:id',
		method: ['PUT'],
		types: {} as LinksIdPut,
	},
	{
		params: ['id'],
		name: 'link.toggle-favorite',
		path: '/links/:id/favorite',
		method: ['PUT'],
		types: {} as LinksIdFavoritePut,
	},
	{
		params: [],
		name: 'link.delete-form',
		path: '/links/delete',
		method: ['GET', 'HEAD'],
		types: {} as LinksDeleteGetHead,
	},
	{
		params: ['id'],
		name: 'link.delete',
		path: '/links/:id',
		method: ['DELETE'],
		types: {} as LinksIdDelete,
	},
	{
		params: [],
		name: 'search',
		path: '/search',
		method: ['GET', 'HEAD'],
		types: {} as SearchGetHead,
	},
] as const;
export const api = {
	routes,
	definition: {} as ApiDefinition,
};
