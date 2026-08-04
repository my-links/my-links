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
    authEvents: typeof routes['admin.authEvents']
    activityEvents: typeof routes['admin.activityEvents']
    users: {
      bulkDelete: typeof routes['admin.users.bulkDelete']
      sendPasswordReset: typeof routes['admin.users.sendPasswordReset']
      revokeAccess: typeof routes['admin.users.revokeAccess']
      verifyEmail: typeof routes['admin.users.verifyEmail']
      setRole: typeof routes['admin.users.setRole']
    }
  }
  collection: {
    create: typeof routes['collection.create']
    favorites: typeof routes['collection.favorites']
    reorderOwned: typeof routes['collection.reorder-owned']
    reorderFollowed: typeof routes['collection.reorder-followed']
    reorderLinks: typeof routes['collection.reorder-links']
    show: typeof routes['collection.show']
    edit: typeof routes['collection.edit']
    delete: typeof routes['collection.delete']
    follow: typeof routes['collection.follow']
    unfollow: typeof routes['collection.unfollow']
  }
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
    password: {
      forgot: typeof routes['auth.password.forgot'] & {
        submit: typeof routes['auth.password.forgot.submit']
      }
      reset: typeof routes['auth.password.reset'] & {
        submit: typeof routes['auth.password.reset.submit']
      }
      set: typeof routes['auth.password.set']
      change: typeof routes['auth.password.change']
    }
    verification: {
      resend: typeof routes['auth.verification.resend']
    }
    verifyEmail: typeof routes['auth.verify-email']
    email: {
      change: typeof routes['auth.email.change'] & {
        confirm: typeof routes['auth.email.change.confirm']
        cancel: typeof routes['auth.email.change.cancel']
      }
    }
    callback: typeof routes['auth.callback']
    logout: typeof routes['auth.logout']
    sudo: typeof routes['auth.sudo'] & {
      submit: typeof routes['auth.sudo.submit']
      google: typeof routes['auth.sudo.google']
    }
    provider: {
      google: {
        link: typeof routes['auth.provider.google.link']
      }
      unlink: typeof routes['auth.provider.unlink']
    }
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
  apiSync: {
    delta: typeof routes['api-sync.delta']
  }
  apiTokens: {
    index: typeof routes['api-tokens.index']
  }
  link: {
    visit: typeof routes['link.visit']
    index: typeof routes['link.index']
    create: typeof routes['link.create']
    edit: typeof routes['link.edit']
    toggleFavorite: typeof routes['link.toggle-favorite']
    moveToCollection: typeof routes['link.move-to-collection']
    addToCollection: typeof routes['link.add-to-collection']
    delete: typeof routes['link.delete']
  }
}
