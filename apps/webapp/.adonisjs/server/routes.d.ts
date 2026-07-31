import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'terms': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'shared': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'favicon': { paramsTuple?: []; params?: {} }
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
    'search': { paramsTuple?: []; params?: {} }
    'extension.authorize': { paramsTuple?: []; params?: {} }
    'user.api-tokens.store': { paramsTuple?: []; params?: {} }
    'user.api-tokens.destroy': { paramsTuple: [ParamValue]; params: {'tokenId': ParamValue} }
    'user.sessions.destroy': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'user.settings': { paramsTuple?: []; params?: {} }
    'user.settings.export': { paramsTuple?: []; params?: {} }
    'user.settings.import': { paramsTuple?: []; params?: {} }
    'user.settings.delete': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.login.submit': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.register.submit': { paramsTuple?: []; params?: {} }
    'auth.password.forgot': { paramsTuple?: []; params?: {} }
    'auth.password.forgot.submit': { paramsTuple?: []; params?: {} }
    'auth.verify-email': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.password.reset.submit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.sudo': { paramsTuple?: []; params?: {} }
    'auth.sudo.submit': { paramsTuple?: []; params?: {} }
    'auth.sudo.google': { paramsTuple?: []; params?: {} }
    'auth.password.set': { paramsTuple?: []; params?: {} }
    'auth.password.change': { paramsTuple?: []; params?: {} }
    'auth.provider.google.link': { paramsTuple?: []; params?: {} }
    'auth.provider.unlink': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
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
    'api-sync.delta': { paramsTuple?: []; params?: {} }
    'api-tokens.index': { paramsTuple?: []; params?: {} }
    'link.visit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.create': { paramsTuple?: []; params?: {} }
    'link.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.toggle-favorite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'terms': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'shared': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'favicon': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.status': { paramsTuple?: []; params?: {} }
    'collection.favorites': { paramsTuple?: []; params?: {} }
    'collection.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'search': { paramsTuple?: []; params?: {} }
    'extension.authorize': { paramsTuple?: []; params?: {} }
    'user.settings': { paramsTuple?: []; params?: {} }
    'user.settings.export': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.password.forgot': { paramsTuple?: []; params?: {} }
    'auth.verify-email': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.sudo': { paramsTuple?: []; params?: {} }
    'auth.sudo.google': { paramsTuple?: []; params?: {} }
    'auth.provider.google.link': { paramsTuple?: []; params?: {} }
    'api-collections.index': { paramsTuple?: []; params?: {} }
    'api-favorites.index': { paramsTuple?: []; params?: {} }
    'api-health.index': { paramsTuple?: []; params?: {} }
    'api-search.index': { paramsTuple?: []; params?: {} }
    'api-sync.delta': { paramsTuple?: []; params?: {} }
    'api-tokens.index': { paramsTuple?: []; params?: {} }
    'link.visit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'terms': { paramsTuple?: []; params?: {} }
    'privacy': { paramsTuple?: []; params?: {} }
    'shared': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'favicon': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.status': { paramsTuple?: []; params?: {} }
    'collection.favorites': { paramsTuple?: []; params?: {} }
    'collection.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'search': { paramsTuple?: []; params?: {} }
    'extension.authorize': { paramsTuple?: []; params?: {} }
    'user.settings': { paramsTuple?: []; params?: {} }
    'user.settings.export': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.password.forgot': { paramsTuple?: []; params?: {} }
    'auth.verify-email': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.password.reset': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth': { paramsTuple?: []; params?: {} }
    'auth.callback': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.sudo': { paramsTuple?: []; params?: {} }
    'auth.sudo.google': { paramsTuple?: []; params?: {} }
    'auth.provider.google.link': { paramsTuple?: []; params?: {} }
    'api-collections.index': { paramsTuple?: []; params?: {} }
    'api-favorites.index': { paramsTuple?: []; params?: {} }
    'api-health.index': { paramsTuple?: []; params?: {} }
    'api-search.index': { paramsTuple?: []; params?: {} }
    'api-sync.delta': { paramsTuple?: []; params?: {} }
    'api-tokens.index': { paramsTuple?: []; params?: {} }
    'link.visit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'admin.users.bulkDelete': { paramsTuple?: []; params?: {} }
    'collection.create': { paramsTuple?: []; params?: {} }
    'collection.follow': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'collection.unfollow': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.api-tokens.store': { paramsTuple?: []; params?: {} }
    'user.settings.import': { paramsTuple?: []; params?: {} }
    'auth.login.submit': { paramsTuple?: []; params?: {} }
    'auth.register.submit': { paramsTuple?: []; params?: {} }
    'auth.password.forgot.submit': { paramsTuple?: []; params?: {} }
    'auth.password.reset.submit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'auth.sudo.submit': { paramsTuple?: []; params?: {} }
    'auth.password.set': { paramsTuple?: []; params?: {} }
    'api-collections.create': { paramsTuple?: []; params?: {} }
    'api-links.create': { paramsTuple?: []; params?: {} }
    'link.create': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'collection.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auth.password.change': { paramsTuple?: []; params?: {} }
    'api-collections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-links.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.toggle-favorite': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'collection.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'user.api-tokens.destroy': { paramsTuple: [ParamValue]; params: {'tokenId': ParamValue} }
    'user.sessions.destroy': { paramsTuple: [ParamValue]; params: {'sessionId': ParamValue} }
    'user.settings.delete': { paramsTuple?: []; params?: {} }
    'auth.provider.unlink': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'api-collections.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api-links.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'link.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}