import { Exception } from '@adonisjs/core/exceptions';
import type { HttpContext } from '@adonisjs/core/http';

const STATUS = 409;
const CODE = 'E_PROVIDER_LINK_REFUSED';

export const PROVIDER_LINK_REFUSAL = {
	ALREADY_LINKED: 'already_linked',
	LINKED_TO_ANOTHER_ACCOUNT: 'linked_to_another_account',
	PROVIDER_SLOT_TAKEN: 'provider_slot_taken',
	NOT_LINKED: 'not_linked',
} as const;

export type ProviderLinkRefusal =
	(typeof PROVIDER_LINK_REFUSAL)[keyof typeof PROVIDER_LINK_REFUSAL];

/**
 * Named causes, like the password refusals and unlike the sign-in ones: the
 * person reading this is authenticated on the account being described, and
 * completing the round trip proved they hold the provider account too. There
 * is nothing left for a generic message to protect.
 */
const REFUSAL_MESSAGES = {
	[PROVIDER_LINK_REFUSAL.ALREADY_LINKED]:
		'This account is already linked to that provider account',
	[PROVIDER_LINK_REFUSAL.LINKED_TO_ANOTHER_ACCOUNT]:
		'That provider account already belongs to another account here',
	[PROVIDER_LINK_REFUSAL.PROVIDER_SLOT_TAKEN]:
		'This account already uses that provider — unlink it before linking another',
	[PROVIDER_LINK_REFUSAL.NOT_LINKED]:
		'This account is not linked to that provider',
} as const satisfies Record<ProviderLinkRefusal, string>;

/**
 * Raised when a link or unlink contradicts the account it targets. Every case
 * means a request reached an endpoint the settings page never offers in that
 * state, so it fails loudly instead of guessing what was meant.
 */
export default class ProviderLinkRefusedException extends Exception {
	static status = STATUS;
	static code = CODE;

	constructor(readonly refusal: ProviderLinkRefusal) {
		super(REFUSAL_MESSAGES[refusal], { status: STATUS, code: CODE });
	}

	async handle(error: this, { session, response }: HttpContext) {
		session.flash('error', error.message);

		return response.redirectToNamedRoute('user.settings');
	}
}
