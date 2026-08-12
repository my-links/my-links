/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home_controller').default['render']>>>
    }
  }
  'terms': {
    methods: ["GET","HEAD"]
    pattern: '/terms'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'privacy': {
    methods: ["GET","HEAD"]
    pattern: '/privacy'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'shared': {
    methods: ["GET","HEAD"]
    pattern: '/shared/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/shared_collections/shared_collection').getSharedCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/shared_collections/shared_collections_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/shared_collections/shared_collections_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'favicon': {
    methods: ["GET","HEAD"]
    pattern: '/favicon'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/favicons/favicons_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/favicons/favicons_controller').default['render']>>>
    }
  }
  'admin.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/admin_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/admin_controller').default['render']>>>
    }
  }
  'admin.status': {
    methods: ["GET","HEAD"]
    pattern: '/admin/status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/status_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/status_controller').default['render']>>>
    }
  }
  'admin.auth-events': {
    methods: ["GET","HEAD"]
    pattern: '/admin/auth-events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/auth_journal_page_validator').authJournalPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/auth_journal_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/auth_journal_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.activity-events': {
    methods: ["GET","HEAD"]
    pattern: '/admin/activity-events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/admin/activity_journal_page_validator').activityJournalPageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/activity_journal_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/activity_journal_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.bulk-delete': {
    methods: ["POST"]
    pattern: '/admin/users/bulk-delete'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/bulk_delete_users_validator').bulkDeleteUsersValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/bulk_delete_users_validator').bulkDeleteUsersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/bulk_delete_users_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/bulk_delete_users_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.send-password-reset': {
    methods: ["POST"]
    pattern: '/admin/users/:id/password-reset'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/account_target_validator').accountTargetValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/account_target_validator').accountTargetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/send_account_password_reset_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/send_account_password_reset_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.revoke-access': {
    methods: ["POST"]
    pattern: '/admin/users/:id/revoke-access'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/account_target_validator').accountTargetValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/account_target_validator').accountTargetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/revoke_account_access_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/revoke_account_access_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.verify-email': {
    methods: ["POST"]
    pattern: '/admin/users/:id/verify-email'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/account_target_validator').accountTargetValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/account_target_validator').accountTargetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/verify_account_email_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/verify_account_email_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.users.set-role': {
    methods: ["PATCH"]
    pattern: '/admin/users/:id/role'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin/account_target_validator').accountTargetValidator)>|InferInput<(typeof import('#validators/admin/account_role_validator').accountRoleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin/account_target_validator').accountTargetValidator)>|InferInput<(typeof import('#validators/admin/account_role_validator').accountRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/set_account_role_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/set_account_role_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.create': {
    methods: ["POST"]
    pattern: '/collections'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/create_collection_validator').createCollectionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/create_collection_validator').createCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/create_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/create_collection_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.favorites': {
    methods: ["GET","HEAD"]
    pattern: '/collections/favorites'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/favorites/show_favorites_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/favorites/show_favorites_controller').default['render']>>>
    }
  }
  'collection.inbox': {
    methods: ["GET","HEAD"]
    pattern: '/collections/inbox'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/show_inbox_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/show_inbox_controller').default['render']>>>
    }
  }
  'collection.reorder-owned': {
    methods: ["PUT"]
    pattern: '/collections/owned/reorder'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/reorder_collections_validator').reorderCollectionsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/reorder_collections_validator').reorderCollectionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/reorder_owned_collections_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/reorder_owned_collections_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.reorder-followed': {
    methods: ["PUT"]
    pattern: '/collections/followed/reorder'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/reorder_followed_collections_validator').reorderFollowedCollectionsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/reorder_followed_collections_validator').reorderFollowedCollectionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/reorder_followed_collections_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/reorder_followed_collections_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.reorder-links': {
    methods: ["PUT"]
    pattern: '/collections/:id/links/reorder'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/reorder_collection_links_validator').reorderCollectionLinksValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/reorder_collection_links_validator').reorderCollectionLinksValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/reorder_collection_links_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/reorder_collection_links_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.show': {
    methods: ["GET","HEAD"]
    pattern: '/collections/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/show_collection_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/show_collection_controller').default['render']>>>
    }
  }
  'collection.edit': {
    methods: ["PUT"]
    pattern: '/collections/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/update_collection_validator').updateCollectionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/update_collection_validator').updateCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/update_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/update_collection_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.delete': {
    methods: ["DELETE"]
    pattern: '/collections/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/delete_collection_validator').deleteCollectionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/delete_collection_validator').deleteCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/delete_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/delete_collection_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'collection.follow': {
    methods: ["POST"]
    pattern: '/collections/:id/follow'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/follow_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/follow_collection_controller').default['execute']>>>
    }
  }
  'collection.unfollow': {
    methods: ["POST"]
    pattern: '/collections/:id/unfollow'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/collections/unfollow_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/collections/unfollow_collection_controller').default['execute']>>>
    }
  }
  'extension.authorize': {
    methods: ["GET","HEAD"]
    pattern: '/extension/authorize'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/extension/authorize_extension_validator').authorizeExtensionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/extension/authorize_extension_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/extension/authorize_extension_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.api-tokens.store': {
    methods: ["POST"]
    pattern: '/user/api-tokens'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user/token/create_api_token').createApiTokenValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user/token/create_api_token').createApiTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user/create_api_token_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user/create_api_token_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.api-tokens.destroy': {
    methods: ["DELETE"]
    pattern: '/user/api-tokens/:tokenId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user/token/delete_api_token').deleteApiTokenValidator)>>
      paramsTuple: [ParamValue]
      params: { tokenId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user/token/delete_api_token').deleteApiTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user/delete_api_token_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user/delete_api_token_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.sessions.destroy': {
    methods: ["DELETE"]
    pattern: '/user/sessions/:sessionId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user/session/delete_session').deleteSessionValidator)>>
      paramsTuple: [ParamValue]
      params: { sessionId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user/session/delete_session').deleteSessionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user/destroy_session_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user/destroy_session_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.settings': {
    methods: ["GET","HEAD"]
    pattern: '/user/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_settings/show_user_settings_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_settings/show_user_settings_controller').default['render']>>>
    }
  }
  'user.settings.export': {
    methods: ["GET","HEAD"]
    pattern: '/user/settings/export'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_settings/export_user_data_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_settings/export_user_data_controller').default['execute']>>>
    }
  }
  'user.settings.import': {
    methods: ["POST"]
    pattern: '/user/settings/import'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_settings/import_file_validator').importFileValidator)>|InferInput<(typeof import('#validators/user_settings/import_data_validator').importDataValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_settings/import_file_validator').importFileValidator)>|InferInput<(typeof import('#validators/user_settings/import_data_validator').importDataValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_settings/import_user_data_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_settings/import_user_data_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'user.settings.delete': {
    methods: ["DELETE"]
    pattern: '/user/settings/account'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_settings/delete_user_account_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_settings/delete_user_account_controller').default['execute']>>>
    }
  }
  'auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['render']>>>
    }
  }
  'auth.login.submit': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/login_validator').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/login_validator').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/login_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.register': {
    methods: ["GET","HEAD"]
    pattern: '/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/register_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/register_controller').default['render']>>>
    }
  }
  'auth.register.submit': {
    methods: ["POST"]
    pattern: '/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/register_validator').registerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/register_validator').registerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/register_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/register_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.password.forgot': {
    methods: ["GET","HEAD"]
    pattern: '/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/request_password_reset_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/request_password_reset_controller').default['render']>>>
    }
  }
  'auth.password.forgot.submit': {
    methods: ["POST"]
    pattern: '/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/email_address_validator').emailAddressValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/email_address_validator').emailAddressValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/request_password_reset_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/request_password_reset_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.verification.resend': {
    methods: ["POST"]
    pattern: '/resend-verification'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/email_address_validator').emailAddressValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/email_address_validator').emailAddressValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/resend_verification_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/resend_verification_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.verify-email': {
    methods: ["GET","HEAD"]
    pattern: '/verify-email/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/auth/one_time_token_validator').oneTimeTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/verify_email_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/verify_email_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.password.reset': {
    methods: ["GET","HEAD"]
    pattern: '/reset-password/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/auth/one_time_token_validator').oneTimeTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/reset_password_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/reset_password_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.password.reset.submit': {
    methods: ["POST"]
    pattern: '/reset-password/:token'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/one_time_token_validator').oneTimeTokenValidator)>|InferInput<(typeof import('#validators/auth/new_password_validator').newPasswordValidator)>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/one_time_token_validator').oneTimeTokenValidator)>|InferInput<(typeof import('#validators/auth/new_password_validator').newPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/reset_password_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/reset_password_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.email.change.confirm': {
    methods: ["GET","HEAD"]
    pattern: '/confirm-email-change/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/auth/one_time_token_validator').oneTimeTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/confirm_email_change_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/confirm_email_change_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.email.change.cancel': {
    methods: ["GET","HEAD"]
    pattern: '/cancel-email-change/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/auth/one_time_token_validator').oneTimeTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/cancel_email_change_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/cancel_email_change_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth': {
    methods: ["GET","HEAD"]
    pattern: '/auth/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['google']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['google']>>>
    }
  }
  'auth.callback': {
    methods: ["GET","HEAD"]
    pattern: '/auth/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['callbackAuth']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['callbackAuth']>>>
    }
  }
  'auth.logout': {
    methods: ["GET","HEAD"]
    pattern: '/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/auth_controller').default['logout']>>>
    }
  }
  'auth.sudo': {
    methods: ["GET","HEAD"]
    pattern: '/sudo'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/sudo_mode_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/sudo_mode_controller').default['render']>>>
    }
  }
  'auth.sudo.submit': {
    methods: ["POST"]
    pattern: '/sudo'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/sudo_confirmation_validator').sudoConfirmationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/sudo_confirmation_validator').sudoConfirmationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/sudo_mode_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/sudo_mode_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.sudo.google': {
    methods: ["GET","HEAD"]
    pattern: '/sudo/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/sudo_mode_google_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/sudo_mode_google_controller').default['execute']>>>
    }
  }
  'auth.password.set': {
    methods: ["POST"]
    pattern: '/account/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/new_password_validator').newPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/new_password_validator').newPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/set_password_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/set_password_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.password.change': {
    methods: ["PUT"]
    pattern: '/account/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/new_password_validator').newPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/new_password_validator').newPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/change_password_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/change_password_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.email.change': {
    methods: ["POST"]
    pattern: '/account/email'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/request_email_change_validator').requestEmailChangeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/request_email_change_validator').requestEmailChangeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/request_email_change_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/request_email_change_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.provider.google.link': {
    methods: ["GET","HEAD"]
    pattern: '/account/providers/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/link_provider_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/link_provider_controller').default['execute']>>>
    }
  }
  'auth.provider.unlink': {
    methods: ["DELETE"]
    pattern: '/account/providers/:provider'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth/auth_provider_validator').authProviderValidator)>>
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/auth/auth_provider_validator').authProviderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth/unlink_provider_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth/unlink_provider_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-collections.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/collections'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/collections/get_collections_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/collections/get_collections_controller').default['render']>>>
    }
  }
  'api-collections.create': {
    methods: ["POST"]
    pattern: '/api/v1/collections'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/create_collection_validator').createCollectionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/create_collection_validator').createCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/collections/create_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/collections/create_collection_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-collections.update': {
    methods: ["PUT"]
    pattern: '/api/v1/collections/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/update_collection_validator').updateCollectionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/update_collection_validator').updateCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/collections/update_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/collections/update_collection_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-collections.delete': {
    methods: ["DELETE"]
    pattern: '/api/v1/collections/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/delete_collection_validator').deleteCollectionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/delete_collection_validator').deleteCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/collections/delete_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/collections/delete_collection_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-collections.reorder-owned': {
    methods: ["PUT"]
    pattern: '/api/v1/collections/owned/reorder'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/reorder_collections_validator').reorderCollectionsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/reorder_collections_validator').reorderCollectionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/collections/reorder_owned_collections_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/collections/reorder_owned_collections_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-collections.reorder-followed': {
    methods: ["PUT"]
    pattern: '/api/v1/collections/followed/reorder'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/reorder_followed_collections_validator').reorderFollowedCollectionsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/reorder_followed_collections_validator').reorderFollowedCollectionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/collections/reorder_followed_collections_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/collections/reorder_followed_collections_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-collections.reorder-links': {
    methods: ["PUT"]
    pattern: '/api/v1/collections/:id/links/reorder'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/collections/reorder_collection_links_validator').reorderCollectionLinksValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/collections/reorder_collection_links_validator').reorderCollectionLinksValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/collections/reorder_collection_links_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/collections/reorder_collection_links_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-favorites.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/links/favorites'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/links/get_favorite_links_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/links/get_favorite_links_controller').default['render']>>>
    }
  }
  'api-health.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/health/health_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/health/health_controller').default['render']>>>
    }
  }
  'api-links.create': {
    methods: ["POST"]
    pattern: '/api/v1/links'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/create_link_api_validator').createLinkApiValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/links/create_link_api_validator').createLinkApiValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/links/create_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/links/create_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-links.update': {
    methods: ["PUT"]
    pattern: '/api/v1/links/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/update_link_validator').updateLinkValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/update_link_validator').updateLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/links/update_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/links/update_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-links.delete': {
    methods: ["DELETE"]
    pattern: '/api/v1/links/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/delete_link_validator').deleteLinkValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/delete_link_validator').deleteLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/links/delete_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/links/delete_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-links.move-to-collection': {
    methods: ["PUT"]
    pattern: '/api/v1/links/:id/collection'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/move_link_validator').moveLinkValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/move_link_validator').moveLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/links/move_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/links/move_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-links.add-to-collection': {
    methods: ["POST"]
    pattern: '/api/v1/links/:id/collections'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/add_link_to_collection_validator').addLinkToCollectionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/add_link_to_collection_validator').addLinkToCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/links/add_link_to_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/links/add_link_to_collection_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-sync.delta': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/sync'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/sync/sync_delta_validator').syncDeltaValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/sync/sync_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/sync/sync_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api-tokens.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/tokens/check'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/tokens/api_token_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/tokens/api_token_controller').default['render']>>>
    }
  }
  'link.visit': {
    methods: ["GET","HEAD"]
    pattern: '/l/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/links/visit_link_validator').visitLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/links/visit_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/links/visit_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'link.index': {
    methods: ["GET","HEAD"]
    pattern: '/links'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/links/get_links_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/links/get_links_controller').default['render']>>>
    }
  }
  'link.create': {
    methods: ["POST"]
    pattern: '/links'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/create_link_validator').createLinkValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/links/create_link_validator').createLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/links/create_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/links/create_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'link.edit': {
    methods: ["PUT"]
    pattern: '/links/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/update_link_validator').updateLinkValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/update_link_validator').updateLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/links/update_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/links/update_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'link.toggle-favorite': {
    methods: ["PUT"]
    pattern: '/links/:id/favorite'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/update_favorite_link_validator').updateLinkFavoriteStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/update_favorite_link_validator').updateLinkFavoriteStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/links/toggle_favorite_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/links/toggle_favorite_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'link.move-to-collection': {
    methods: ["PUT"]
    pattern: '/links/:id/collection'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/move_link_validator').moveLinkValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/move_link_validator').moveLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/links/move_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/links/move_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'link.add-to-collection': {
    methods: ["POST"]
    pattern: '/links/:id/collections'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/add_link_to_collection_validator').addLinkToCollectionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/add_link_to_collection_validator').addLinkToCollectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/links/add_link_to_collection_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/links/add_link_to_collection_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'link.delete': {
    methods: ["DELETE"]
    pattern: '/links/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/links/delete_link_validator').deleteLinkValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/links/delete_link_validator').deleteLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/links/delete_link_controller').default['execute']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/links/delete_link_controller').default['execute']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
