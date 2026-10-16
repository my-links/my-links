import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { InvalidAdminSetupTokenConfigException } from '#exceptions/auth/invalid_admin_setup_token_config_exception';

export const ADMIN_SETUP_TOKEN_MINIMUM_LENGTH = 32;
const GENERATED_TOKEN_BYTES = 32;

export function generateAdminSetupToken(): string {
	return randomBytes(GENERATED_TOKEN_BYTES).toString('base64url');
}

/**
 * Parses the `ADMIN_SETUP_TOKEN` env value. Doubles as an `Env.schema`
 * validator: a token too short to resist guessing stops the boot instead of
 * being accepted quietly.
 */
export function parseAdminSetupToken(
	_key: string,
	rawValue?: string
): string | undefined {
	const configuredToken = rawValue?.trim();
	if (!configuredToken) return undefined;

	if (configuredToken.length < ADMIN_SETUP_TOKEN_MINIMUM_LENGTH) {
		throw new InvalidAdminSetupTokenConfigException(
			ADMIN_SETUP_TOKEN_MINIMUM_LENGTH
		);
	}

	return configuredToken;
}

export function resolveAdminSetupToken(
	configuredToken: string | undefined
): string {
	return configuredToken ?? generateAdminSetupToken();
}

/**
 * Hashing both sides first gives `timingSafeEqual` the equal lengths it
 * demands without revealing the expected token's length.
 */
export function isMatchingSetupToken(
	expectedToken: string,
	submittedToken: string | undefined
): boolean {
	if (!submittedToken) return false;

	return timingSafeEqual(digestOf(expectedToken), digestOf(submittedToken));
}

function digestOf(value: string): Buffer {
	return createHash('sha256').update(value).digest();
}
