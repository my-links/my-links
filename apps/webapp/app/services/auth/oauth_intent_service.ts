import type { Session } from '@adonisjs/session';

/**
 * Exported because the functional suite asserts what a departing round trip
 * armed, and reads it straight out of the session store.
 */
export const OAUTH_INTENT_SESSION_KEY = 'oauth_intent';

/**
 * What a returning OAuth identity is supposed to mean.
 *
 * There is a single callback URL — it is fixed in the provider's own
 * configuration, and a second one would mean every self-hoster registering a
 * second redirect URI — so the meaning has to travel in the session instead of
 * in the route. One value rather than one flag per flow: two booleans can both
 * be armed at once, and the callback would then have to invent a precedence
 * rule for a state nothing should be able to produce.
 */
export const OAUTH_INTENT = {
	SIGN_IN: 'sign_in',
	SUDO_CONFIRMATION: 'sudo_confirmation',
	PROVIDER_LINK: 'provider_link',
} as const;

export type OauthIntent = (typeof OAUTH_INTENT)[keyof typeof OAUTH_INTENT];

/**
 * Signing in is what the callback does when nothing said otherwise, so it is
 * the one intent nobody arms.
 */
export type ArmableOauthIntent = Exclude<
	OauthIntent,
	typeof OAUTH_INTENT.SIGN_IN
>;

function isArmableIntent(value: unknown): value is ArmableOauthIntent {
	return (
		value === OAUTH_INTENT.SUDO_CONFIRMATION ||
		value === OAUTH_INTENT.PROVIDER_LINK
	);
}

export class OauthIntentService {
	arm(session: Session, intent: ArmableOauthIntent): void {
		session.put(OAUTH_INTENT_SESSION_KEY, intent);
	}

	/**
	 * Reads the intent and clears it in one move, so an abandoned or failed
	 * round trip cannot leave the callback armed for the next one.
	 */
	take(session: Session): OauthIntent {
		const storedIntent: unknown = session.get(OAUTH_INTENT_SESSION_KEY);
		session.forget(OAUTH_INTENT_SESSION_KEY);

		return isArmableIntent(storedIntent) ? storedIntent : OAUTH_INTENT.SIGN_IN;
	}
}
