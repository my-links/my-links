/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'terms': {
    methods: ["GET","HEAD"],
    pattern: '/terms',
    tokens: [{"old":"/terms","type":0,"val":"terms","end":""}],
    types: placeholder as Registry['terms']['types'],
  },
  'privacy': {
    methods: ["GET","HEAD"],
    pattern: '/privacy',
    tokens: [{"old":"/privacy","type":0,"val":"privacy","end":""}],
    types: placeholder as Registry['privacy']['types'],
  },
  'shared': {
    methods: ["GET","HEAD"],
    pattern: '/shared/:id',
    tokens: [{"old":"/shared/:id","type":0,"val":"shared","end":""},{"old":"/shared/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['shared']['types'],
  },
  'favicon': {
    methods: ["GET","HEAD"],
    pattern: '/favicon',
    tokens: [{"old":"/favicon","type":0,"val":"favicon","end":""}],
    types: placeholder as Registry['favicon']['types'],
  },
  'admin.dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/admin',
    tokens: [{"old":"/admin","type":0,"val":"admin","end":""}],
    types: placeholder as Registry['admin.dashboard']['types'],
  },
  'admin.status': {
    methods: ["GET","HEAD"],
    pattern: '/admin/status',
    tokens: [{"old":"/admin/status","type":0,"val":"admin","end":""},{"old":"/admin/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['admin.status']['types'],
  },
  'admin.authEvents': {
    methods: ["GET","HEAD"],
    pattern: '/admin/auth-events',
    tokens: [{"old":"/admin/auth-events","type":0,"val":"admin","end":""},{"old":"/admin/auth-events","type":0,"val":"auth-events","end":""}],
    types: placeholder as Registry['admin.authEvents']['types'],
  },
  'admin.activityEvents': {
    methods: ["GET","HEAD"],
    pattern: '/admin/activity-events',
    tokens: [{"old":"/admin/activity-events","type":0,"val":"admin","end":""},{"old":"/admin/activity-events","type":0,"val":"activity-events","end":""}],
    types: placeholder as Registry['admin.activityEvents']['types'],
  },
  'admin.users.bulkDelete': {
    methods: ["POST"],
    pattern: '/admin/users/bulk-delete',
    tokens: [{"old":"/admin/users/bulk-delete","type":0,"val":"admin","end":""},{"old":"/admin/users/bulk-delete","type":0,"val":"users","end":""},{"old":"/admin/users/bulk-delete","type":0,"val":"bulk-delete","end":""}],
    types: placeholder as Registry['admin.users.bulkDelete']['types'],
  },
  'admin.users.sendPasswordReset': {
    methods: ["POST"],
    pattern: '/admin/users/:id/password-reset',
    tokens: [{"old":"/admin/users/:id/password-reset","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/password-reset","type":0,"val":"users","end":""},{"old":"/admin/users/:id/password-reset","type":1,"val":"id","end":""},{"old":"/admin/users/:id/password-reset","type":0,"val":"password-reset","end":""}],
    types: placeholder as Registry['admin.users.sendPasswordReset']['types'],
  },
  'admin.users.revokeAccess': {
    methods: ["POST"],
    pattern: '/admin/users/:id/revoke-access',
    tokens: [{"old":"/admin/users/:id/revoke-access","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/revoke-access","type":0,"val":"users","end":""},{"old":"/admin/users/:id/revoke-access","type":1,"val":"id","end":""},{"old":"/admin/users/:id/revoke-access","type":0,"val":"revoke-access","end":""}],
    types: placeholder as Registry['admin.users.revokeAccess']['types'],
  },
  'admin.users.verifyEmail': {
    methods: ["POST"],
    pattern: '/admin/users/:id/verify-email',
    tokens: [{"old":"/admin/users/:id/verify-email","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/verify-email","type":0,"val":"users","end":""},{"old":"/admin/users/:id/verify-email","type":1,"val":"id","end":""},{"old":"/admin/users/:id/verify-email","type":0,"val":"verify-email","end":""}],
    types: placeholder as Registry['admin.users.verifyEmail']['types'],
  },
  'admin.users.setRole': {
    methods: ["PATCH"],
    pattern: '/admin/users/:id/role',
    tokens: [{"old":"/admin/users/:id/role","type":0,"val":"admin","end":""},{"old":"/admin/users/:id/role","type":0,"val":"users","end":""},{"old":"/admin/users/:id/role","type":1,"val":"id","end":""},{"old":"/admin/users/:id/role","type":0,"val":"role","end":""}],
    types: placeholder as Registry['admin.users.setRole']['types'],
  },
  'collection.create': {
    methods: ["POST"],
    pattern: '/collections',
    tokens: [{"old":"/collections","type":0,"val":"collections","end":""}],
    types: placeholder as Registry['collection.create']['types'],
  },
  'collection.favorites': {
    methods: ["GET","HEAD"],
    pattern: '/collections/favorites',
    tokens: [{"old":"/collections/favorites","type":0,"val":"collections","end":""},{"old":"/collections/favorites","type":0,"val":"favorites","end":""}],
    types: placeholder as Registry['collection.favorites']['types'],
  },
  'collection.reorder-owned': {
    methods: ["PUT"],
    pattern: '/collections/owned/reorder',
    tokens: [{"old":"/collections/owned/reorder","type":0,"val":"collections","end":""},{"old":"/collections/owned/reorder","type":0,"val":"owned","end":""},{"old":"/collections/owned/reorder","type":0,"val":"reorder","end":""}],
    types: placeholder as Registry['collection.reorder-owned']['types'],
  },
  'collection.reorder-followed': {
    methods: ["PUT"],
    pattern: '/collections/followed/reorder',
    tokens: [{"old":"/collections/followed/reorder","type":0,"val":"collections","end":""},{"old":"/collections/followed/reorder","type":0,"val":"followed","end":""},{"old":"/collections/followed/reorder","type":0,"val":"reorder","end":""}],
    types: placeholder as Registry['collection.reorder-followed']['types'],
  },
  'collection.reorder-links': {
    methods: ["PUT"],
    pattern: '/collections/:id/links/reorder',
    tokens: [{"old":"/collections/:id/links/reorder","type":0,"val":"collections","end":""},{"old":"/collections/:id/links/reorder","type":1,"val":"id","end":""},{"old":"/collections/:id/links/reorder","type":0,"val":"links","end":""},{"old":"/collections/:id/links/reorder","type":0,"val":"reorder","end":""}],
    types: placeholder as Registry['collection.reorder-links']['types'],
  },
  'collection.show': {
    methods: ["GET","HEAD"],
    pattern: '/collections/:id',
    tokens: [{"old":"/collections/:id","type":0,"val":"collections","end":""},{"old":"/collections/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['collection.show']['types'],
  },
  'collection.edit': {
    methods: ["PUT"],
    pattern: '/collections/:id',
    tokens: [{"old":"/collections/:id","type":0,"val":"collections","end":""},{"old":"/collections/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['collection.edit']['types'],
  },
  'collection.delete': {
    methods: ["DELETE"],
    pattern: '/collections/:id',
    tokens: [{"old":"/collections/:id","type":0,"val":"collections","end":""},{"old":"/collections/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['collection.delete']['types'],
  },
  'collection.follow': {
    methods: ["POST"],
    pattern: '/collections/:id/follow',
    tokens: [{"old":"/collections/:id/follow","type":0,"val":"collections","end":""},{"old":"/collections/:id/follow","type":1,"val":"id","end":""},{"old":"/collections/:id/follow","type":0,"val":"follow","end":""}],
    types: placeholder as Registry['collection.follow']['types'],
  },
  'collection.unfollow': {
    methods: ["POST"],
    pattern: '/collections/:id/unfollow',
    tokens: [{"old":"/collections/:id/unfollow","type":0,"val":"collections","end":""},{"old":"/collections/:id/unfollow","type":1,"val":"id","end":""},{"old":"/collections/:id/unfollow","type":0,"val":"unfollow","end":""}],
    types: placeholder as Registry['collection.unfollow']['types'],
  },
  'extension.authorize': {
    methods: ["GET","HEAD"],
    pattern: '/extension/authorize',
    tokens: [{"old":"/extension/authorize","type":0,"val":"extension","end":""},{"old":"/extension/authorize","type":0,"val":"authorize","end":""}],
    types: placeholder as Registry['extension.authorize']['types'],
  },
  'user.api-tokens.store': {
    methods: ["POST"],
    pattern: '/user/api-tokens',
    tokens: [{"old":"/user/api-tokens","type":0,"val":"user","end":""},{"old":"/user/api-tokens","type":0,"val":"api-tokens","end":""}],
    types: placeholder as Registry['user.api-tokens.store']['types'],
  },
  'user.api-tokens.destroy': {
    methods: ["DELETE"],
    pattern: '/user/api-tokens/:tokenId',
    tokens: [{"old":"/user/api-tokens/:tokenId","type":0,"val":"user","end":""},{"old":"/user/api-tokens/:tokenId","type":0,"val":"api-tokens","end":""},{"old":"/user/api-tokens/:tokenId","type":1,"val":"tokenId","end":""}],
    types: placeholder as Registry['user.api-tokens.destroy']['types'],
  },
  'user.sessions.destroy': {
    methods: ["DELETE"],
    pattern: '/user/sessions/:sessionId',
    tokens: [{"old":"/user/sessions/:sessionId","type":0,"val":"user","end":""},{"old":"/user/sessions/:sessionId","type":0,"val":"sessions","end":""},{"old":"/user/sessions/:sessionId","type":1,"val":"sessionId","end":""}],
    types: placeholder as Registry['user.sessions.destroy']['types'],
  },
  'user.settings': {
    methods: ["GET","HEAD"],
    pattern: '/user/settings',
    tokens: [{"old":"/user/settings","type":0,"val":"user","end":""},{"old":"/user/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['user.settings']['types'],
  },
  'user.settings.export': {
    methods: ["GET","HEAD"],
    pattern: '/user/settings/export',
    tokens: [{"old":"/user/settings/export","type":0,"val":"user","end":""},{"old":"/user/settings/export","type":0,"val":"settings","end":""},{"old":"/user/settings/export","type":0,"val":"export","end":""}],
    types: placeholder as Registry['user.settings.export']['types'],
  },
  'user.settings.import': {
    methods: ["POST"],
    pattern: '/user/settings/import',
    tokens: [{"old":"/user/settings/import","type":0,"val":"user","end":""},{"old":"/user/settings/import","type":0,"val":"settings","end":""},{"old":"/user/settings/import","type":0,"val":"import","end":""}],
    types: placeholder as Registry['user.settings.import']['types'],
  },
  'user.settings.delete': {
    methods: ["DELETE"],
    pattern: '/user/settings/account',
    tokens: [{"old":"/user/settings/account","type":0,"val":"user","end":""},{"old":"/user/settings/account","type":0,"val":"settings","end":""},{"old":"/user/settings/account","type":0,"val":"account","end":""}],
    types: placeholder as Registry['user.settings.delete']['types'],
  },
  'auth.login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.login.submit': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login.submit']['types'],
  },
  'auth.register': {
    methods: ["GET","HEAD"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.register.submit': {
    methods: ["POST"],
    pattern: '/register',
    tokens: [{"old":"/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register.submit']['types'],
  },
  'auth.password.forgot': {
    methods: ["GET","HEAD"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['auth.password.forgot']['types'],
  },
  'auth.password.forgot.submit': {
    methods: ["POST"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['auth.password.forgot.submit']['types'],
  },
  'auth.verification.resend': {
    methods: ["POST"],
    pattern: '/resend-verification',
    tokens: [{"old":"/resend-verification","type":0,"val":"resend-verification","end":""}],
    types: placeholder as Registry['auth.verification.resend']['types'],
  },
  'auth.verify-email': {
    methods: ["GET","HEAD"],
    pattern: '/verify-email/:token',
    tokens: [{"old":"/verify-email/:token","type":0,"val":"verify-email","end":""},{"old":"/verify-email/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.verify-email']['types'],
  },
  'auth.password.reset': {
    methods: ["GET","HEAD"],
    pattern: '/reset-password/:token',
    tokens: [{"old":"/reset-password/:token","type":0,"val":"reset-password","end":""},{"old":"/reset-password/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.password.reset']['types'],
  },
  'auth.password.reset.submit': {
    methods: ["POST"],
    pattern: '/reset-password/:token',
    tokens: [{"old":"/reset-password/:token","type":0,"val":"reset-password","end":""},{"old":"/reset-password/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.password.reset.submit']['types'],
  },
  'auth.email.change.confirm': {
    methods: ["GET","HEAD"],
    pattern: '/confirm-email-change/:token',
    tokens: [{"old":"/confirm-email-change/:token","type":0,"val":"confirm-email-change","end":""},{"old":"/confirm-email-change/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.email.change.confirm']['types'],
  },
  'auth.email.change.cancel': {
    methods: ["GET","HEAD"],
    pattern: '/cancel-email-change/:token',
    tokens: [{"old":"/cancel-email-change/:token","type":0,"val":"cancel-email-change","end":""},{"old":"/cancel-email-change/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['auth.email.change.cancel']['types'],
  },
  'auth': {
    methods: ["GET","HEAD"],
    pattern: '/auth/google',
    tokens: [{"old":"/auth/google","type":0,"val":"auth","end":""},{"old":"/auth/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['auth']['types'],
  },
  'auth.callback': {
    methods: ["GET","HEAD"],
    pattern: '/auth/callback',
    tokens: [{"old":"/auth/callback","type":0,"val":"auth","end":""},{"old":"/auth/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['auth.callback']['types'],
  },
  'auth.logout': {
    methods: ["GET","HEAD"],
    pattern: '/auth/logout',
    tokens: [{"old":"/auth/logout","type":0,"val":"auth","end":""},{"old":"/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.sudo': {
    methods: ["GET","HEAD"],
    pattern: '/sudo',
    tokens: [{"old":"/sudo","type":0,"val":"sudo","end":""}],
    types: placeholder as Registry['auth.sudo']['types'],
  },
  'auth.sudo.submit': {
    methods: ["POST"],
    pattern: '/sudo',
    tokens: [{"old":"/sudo","type":0,"val":"sudo","end":""}],
    types: placeholder as Registry['auth.sudo.submit']['types'],
  },
  'auth.sudo.google': {
    methods: ["GET","HEAD"],
    pattern: '/sudo/google',
    tokens: [{"old":"/sudo/google","type":0,"val":"sudo","end":""},{"old":"/sudo/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['auth.sudo.google']['types'],
  },
  'auth.password.set': {
    methods: ["POST"],
    pattern: '/account/password',
    tokens: [{"old":"/account/password","type":0,"val":"account","end":""},{"old":"/account/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['auth.password.set']['types'],
  },
  'auth.password.change': {
    methods: ["PUT"],
    pattern: '/account/password',
    tokens: [{"old":"/account/password","type":0,"val":"account","end":""},{"old":"/account/password","type":0,"val":"password","end":""}],
    types: placeholder as Registry['auth.password.change']['types'],
  },
  'auth.email.change': {
    methods: ["POST"],
    pattern: '/account/email',
    tokens: [{"old":"/account/email","type":0,"val":"account","end":""},{"old":"/account/email","type":0,"val":"email","end":""}],
    types: placeholder as Registry['auth.email.change']['types'],
  },
  'auth.provider.google.link': {
    methods: ["GET","HEAD"],
    pattern: '/account/providers/google',
    tokens: [{"old":"/account/providers/google","type":0,"val":"account","end":""},{"old":"/account/providers/google","type":0,"val":"providers","end":""},{"old":"/account/providers/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['auth.provider.google.link']['types'],
  },
  'auth.provider.unlink': {
    methods: ["DELETE"],
    pattern: '/account/providers/:provider',
    tokens: [{"old":"/account/providers/:provider","type":0,"val":"account","end":""},{"old":"/account/providers/:provider","type":0,"val":"providers","end":""},{"old":"/account/providers/:provider","type":1,"val":"provider","end":""}],
    types: placeholder as Registry['auth.provider.unlink']['types'],
  },
  'api-collections.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/collections',
    tokens: [{"old":"/api/v1/collections","type":0,"val":"api","end":""},{"old":"/api/v1/collections","type":0,"val":"v1","end":""},{"old":"/api/v1/collections","type":0,"val":"collections","end":""}],
    types: placeholder as Registry['api-collections.index']['types'],
  },
  'api-collections.create': {
    methods: ["POST"],
    pattern: '/api/v1/collections',
    tokens: [{"old":"/api/v1/collections","type":0,"val":"api","end":""},{"old":"/api/v1/collections","type":0,"val":"v1","end":""},{"old":"/api/v1/collections","type":0,"val":"collections","end":""}],
    types: placeholder as Registry['api-collections.create']['types'],
  },
  'api-collections.update': {
    methods: ["PUT"],
    pattern: '/api/v1/collections/:id',
    tokens: [{"old":"/api/v1/collections/:id","type":0,"val":"api","end":""},{"old":"/api/v1/collections/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/collections/:id","type":0,"val":"collections","end":""},{"old":"/api/v1/collections/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api-collections.update']['types'],
  },
  'api-collections.delete': {
    methods: ["DELETE"],
    pattern: '/api/v1/collections/:id',
    tokens: [{"old":"/api/v1/collections/:id","type":0,"val":"api","end":""},{"old":"/api/v1/collections/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/collections/:id","type":0,"val":"collections","end":""},{"old":"/api/v1/collections/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api-collections.delete']['types'],
  },
  'api-favorites.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/links/favorites',
    tokens: [{"old":"/api/v1/links/favorites","type":0,"val":"api","end":""},{"old":"/api/v1/links/favorites","type":0,"val":"v1","end":""},{"old":"/api/v1/links/favorites","type":0,"val":"links","end":""},{"old":"/api/v1/links/favorites","type":0,"val":"favorites","end":""}],
    types: placeholder as Registry['api-favorites.index']['types'],
  },
  'api-health.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/health',
    tokens: [{"old":"/api/v1/health","type":0,"val":"api","end":""},{"old":"/api/v1/health","type":0,"val":"v1","end":""},{"old":"/api/v1/health","type":0,"val":"health","end":""}],
    types: placeholder as Registry['api-health.index']['types'],
  },
  'api-links.create': {
    methods: ["POST"],
    pattern: '/api/v1/links',
    tokens: [{"old":"/api/v1/links","type":0,"val":"api","end":""},{"old":"/api/v1/links","type":0,"val":"v1","end":""},{"old":"/api/v1/links","type":0,"val":"links","end":""}],
    types: placeholder as Registry['api-links.create']['types'],
  },
  'api-links.update': {
    methods: ["PUT"],
    pattern: '/api/v1/links/:id',
    tokens: [{"old":"/api/v1/links/:id","type":0,"val":"api","end":""},{"old":"/api/v1/links/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/links/:id","type":0,"val":"links","end":""},{"old":"/api/v1/links/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api-links.update']['types'],
  },
  'api-links.delete': {
    methods: ["DELETE"],
    pattern: '/api/v1/links/:id',
    tokens: [{"old":"/api/v1/links/:id","type":0,"val":"api","end":""},{"old":"/api/v1/links/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/links/:id","type":0,"val":"links","end":""},{"old":"/api/v1/links/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api-links.delete']['types'],
  },
  'api-sync.delta': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/sync',
    tokens: [{"old":"/api/v1/sync","type":0,"val":"api","end":""},{"old":"/api/v1/sync","type":0,"val":"v1","end":""},{"old":"/api/v1/sync","type":0,"val":"sync","end":""}],
    types: placeholder as Registry['api-sync.delta']['types'],
  },
  'api-tokens.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tokens/check',
    tokens: [{"old":"/api/v1/tokens/check","type":0,"val":"api","end":""},{"old":"/api/v1/tokens/check","type":0,"val":"v1","end":""},{"old":"/api/v1/tokens/check","type":0,"val":"tokens","end":""},{"old":"/api/v1/tokens/check","type":0,"val":"check","end":""}],
    types: placeholder as Registry['api-tokens.index']['types'],
  },
  'link.visit': {
    methods: ["GET","HEAD"],
    pattern: '/l/:id',
    tokens: [{"old":"/l/:id","type":0,"val":"l","end":""},{"old":"/l/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['link.visit']['types'],
  },
  'link.index': {
    methods: ["GET","HEAD"],
    pattern: '/links',
    tokens: [{"old":"/links","type":0,"val":"links","end":""}],
    types: placeholder as Registry['link.index']['types'],
  },
  'link.create': {
    methods: ["POST"],
    pattern: '/links',
    tokens: [{"old":"/links","type":0,"val":"links","end":""}],
    types: placeholder as Registry['link.create']['types'],
  },
  'link.edit': {
    methods: ["PUT"],
    pattern: '/links/:id',
    tokens: [{"old":"/links/:id","type":0,"val":"links","end":""},{"old":"/links/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['link.edit']['types'],
  },
  'link.toggle-favorite': {
    methods: ["PUT"],
    pattern: '/links/:id/favorite',
    tokens: [{"old":"/links/:id/favorite","type":0,"val":"links","end":""},{"old":"/links/:id/favorite","type":1,"val":"id","end":""},{"old":"/links/:id/favorite","type":0,"val":"favorite","end":""}],
    types: placeholder as Registry['link.toggle-favorite']['types'],
  },
  'link.delete': {
    methods: ["DELETE"],
    pattern: '/links/:id',
    tokens: [{"old":"/links/:id","type":0,"val":"links","end":""},{"old":"/links/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['link.delete']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
