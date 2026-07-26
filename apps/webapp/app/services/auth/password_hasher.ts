import hash from '@adonisjs/core/services/hash';

/**
 * Seam over the configured hasher.
 *
 * It exists so `CredentialsAuthService` can be handed a counting double: the
 * guarantee it makes — every failed sign-in pays for one hash comparison — is
 * a timing property, and asserting a timing property against the real hasher
 * means measuring durations, which is exactly how flaky tests are born.
 */
export class PasswordHasher {
	make(plainPassword: string): Promise<string> {
		return hash.make(plainPassword);
	}

	verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
		return hash.verify(hashedPassword, plainPassword);
	}
}
