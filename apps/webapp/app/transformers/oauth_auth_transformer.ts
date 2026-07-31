import { BaseTransformer } from '@adonisjs/core/transformers';

import type OauthAuth from '#models/oauth_auth';

/**
 * What the settings page is allowed to know about a linked identity. The
 * provider's own user id stays server-side: it identifies the account on the
 * provider, and nothing in the interface acts on it.
 */
export default class OauthAuthTransformer extends BaseTransformer<OauthAuth> {
	toObject() {
		return {
			provider: this.resource.provider,
			linkedAt: this.resource.linkedAt?.toString(),
		};
	}
}
