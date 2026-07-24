import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'terms': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'shared': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'favicon': { paramsTuple?: []; params?: {} }
    'auth': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.status': { paramsTuple?: []; params?: {} }
    'admin.users.bulkDelete': { paramsTuple?: []; params?: {} }
    'collection.create': { paramsTuple?: []; params?: {} }
    'collection.favorites': { paramsTuple?: []; params?: {} }
    'collection.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.follow': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.unfollow': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.create': { paramsTuple?: []; params?: {} }
    'link.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.toggle-favorite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'search': { paramsTuple?: []; params?: {} }
    'extension.authorize': { paramsTuple?: []; params?: {} }
    'user.api-tokens.store': { paramsTuple?: []; params?: {} }
    'user.api-tokens.destroy': { paramsTuple: [ParamValue]; params: {'tokenId': ParamValue} }
    'user.sessions.destroy': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'user.settings': { paramsTuple?: []; params?: {} }
    'user.settings.export': { paramsTuple?: []; params?: {} }
    'user.settings.import': { paramsTuple?: []; params?: {} }
    'user.settings.delete': { paramsTuple?: []; params?: {} }
    'api-collections.index': { paramsTuple?: []; params?: {} }
    'api-collections.create': { paramsTuple?: []; params?: {} }
    'api-collections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-collections.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-favorites.index': { paramsTuple?: []; params?: {} }
    'api-health.index': { paramsTuple?: []; params?: {} }
    'api-links.create': { paramsTuple?: []; params?: {} }
    'api-links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-links.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-search.index': { paramsTuple?: []; params?: {} }
    'api-tokens.index': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'terms': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'shared': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'favicon': { paramsTuple?: []; params?: {} }
    'auth': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.status': { paramsTuple?: []; params?: {} }
    'collection.favorites': { paramsTuple?: []; params?: {} }
    'collection.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'search': { paramsTuple?: []; params?: {} }
    'extension.authorize': { paramsTuple?: []; params?: {} }
    'user.settings': { paramsTuple?: []; params?: {} }
    'user.settings.export': { paramsTuple?: []; params?: {} }
    'api-collections.index': { paramsTuple?: []; params?: {} }
    'api-favorites.index': { paramsTuple?: []; params?: {} }
    'api-health.index': { paramsTuple?: []; params?: {} }
    'api-search.index': { paramsTuple?: []; params?: {} }
    'api-tokens.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'terms': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'shared': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'favicon': { paramsTuple?: []; params?: {} }
    'auth': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.status': { paramsTuple?: []; params?: {} }
    'collection.favorites': { paramsTuple?: []; params?: {} }
    'collection.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'search': { paramsTuple?: []; params?: {} }
    'extension.authorize': { paramsTuple?: []; params?: {} }
    'user.settings': { paramsTuple?: []; params?: {} }
    'user.settings.export': { paramsTuple?: []; params?: {} }
    'api-collections.index': { paramsTuple?: []; params?: {} }
    'api-favorites.index': { paramsTuple?: []; params?: {} }
    'api-health.index': { paramsTuple?: []; params?: {} }
    'api-search.index': { paramsTuple?: []; params?: {} }
    'api-tokens.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'admin.users.bulkDelete': { paramsTuple?: []; params?: {} }
    'collection.create': { paramsTuple?: []; params?: {} }
    'collection.follow': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.unfollow': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.create': { paramsTuple?: []; params?: {} }
    'user.api-tokens.store': { paramsTuple?: []; params?: {} }
    'user.settings.import': { paramsTuple?: []; params?: {} }
    'api-collections.create': { paramsTuple?: []; params?: {} }
    'api-links.create': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'collection.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.toggle-favorite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-collections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'collection.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.api-tokens.destroy': { paramsTuple: [ParamValue]; params: {'tokenId': ParamValue} }
    'user.sessions.destroy': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'user.settings.delete': { paramsTuple?: []; params?: {} }
    'api-collections.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-links.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}