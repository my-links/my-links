/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  terms: typeof routes['terms']
  privacy: typeof routes['privacy']
  shared: typeof routes['shared']
  favicon: typeof routes['favicon']
  admin: {
    dashboard: typeof routes['admin.dashboard']
    status: typeof routes['admin.status']
    users: {
      bulkDelete: typeof routes['admin.users.bulkDelete']
    }
  }
  collection: {
    create: typeof routes['collection.create']
    favorites: typeof routes['collection.favorites']
    show: typeof routes['collection.show']
    edit: typeof routes['collection.edit']
    delete: typeof routes['collection.delete']
    follow: typeof routes['collection.follow']
    unfollow: typeof routes['collection.unfollow']
  }
  search: typeof routes['search']
  extension: {
    authorize: typeof routes['extension.authorize']
  }
  user: {
    apiTokens: {
      store: typeof routes['user.api-tokens.store']
      destroy: typeof routes['user.api-tokens.destroy']
    }
    sessions: {
      destroy: typeof routes['user.sessions.destroy']
    }
    settings: typeof routes['user.settings'] & {
      export: typeof routes['user.settings.export']
      import: typeof routes['user.settings.import']
      delete: typeof routes['user.settings.delete']
    }
  }
  auth: typeof routes['auth'] & {
    login: typeof routes['auth.login'] & {
      submit: typeof routes['auth.login.submit']
    }
    register: typeof routes['auth.register'] & {
      submit: typeof routes['auth.register.submit']
    }
    verifyEmail: typeof routes['auth.verify-email']
    callback: typeof routes['auth.callback']
    logout: typeof routes['auth.logout']
  }
  apiCollections: {
    index: typeof routes['api-collections.index']
    create: typeof routes['api-collections.create']
    update: typeof routes['api-collections.update']
    delete: typeof routes['api-collections.delete']
  }
  apiFavorites: {
    index: typeof routes['api-favorites.index']
  }
  apiHealth: {
    index: typeof routes['api-health.index']
  }
  apiLinks: {
    create: typeof routes['api-links.create']
    update: typeof routes['api-links.update']
    delete: typeof routes['api-links.delete']
  }
  apiSearch: {
    index: typeof routes['api-search.index']
  }
  apiSync: {
    delta: typeof routes['api-sync.delta']
  }
  apiTokens: {
    index: typeof routes['api-tokens.index']
  }
  link: {
    visit: typeof routes['link.visit']
    create: typeof routes['link.create']
    edit: typeof routes['link.edit']
    toggleFavorite: typeof routes['link.toggle-favorite']
    delete: typeof routes['link.delete']
  }
}
