import { BaseCommand } from '@adonisjs/core/ace';
import { errors as vineErrors } from '@vinejs/vine';
import { Exception } from '@adonisjs/core/exceptions';
import type { CommandOptions } from '@adonisjs/core/types/ace';

import User from '#models/user';
import { emailAddressValidator } from '#validators/auth/email_address_validator';

export const EMAIL_PROMPT = 'Email address';

const FAILURE_EXIT_CODE = 1;

type ValidationMessage = {
	readonly message: string;
};

/**
 * Shared ground for the `user:*` commands.
 *
 * The leading underscore is what keeps this file from being loaded as a
 * command: ace scans the whole directory and expects every file in it to
 * default-export a command, and skips the ones whose name starts with `_`.
 * Same reasoning as the backfill helpers living outside `database/migrations`.
 */
export default abstract class AccountCommand extends BaseCommand {
	static options: CommandOptions = { startApp: true };

	/**
	 * Builds the route lookup store the console never gets for free.
	 *
	 * Routes are committed when the HTTP server starts, and no server starts
	 * here — so a command turning a route name into a URL, which is what
	 * printing a reset link does, would be told the route does not exist.
	 * Committing is idempotent, so every `user:*` command can afford to ask.
	 */
	async prepare(): Promise<void> {
		const router = await this.app.container.make('router');

		router.commit();
	}

	/**
	 * Turns a refusal into lines an operator can act on.
	 *
	 * A mistyped address and an account that cannot afford to lose its last
	 * administrator are both ordinary answers, not crashes, and a stack trace
	 * would bury the one sentence that matters. Anything this does not
	 * recognize is re-thrown untouched — an unexpected failure has every right
	 * to be loud.
	 */
	async completed(): Promise<boolean> {
		if (!this.error) return false;

		if (this.error instanceof vineErrors.E_VALIDATION_ERROR) {
			toValidationMessages(this.error.messages).forEach(({ message }) =>
				this.logger.error(message)
			);

			return true;
		}

		if (this.error instanceof Exception) {
			this.logger.error(this.error.message);

			return true;
		}

		return false;
	}

	/**
	 * Reads the address off the CLI, or asks for it. Either way it goes through
	 * the same validator the sign-in and recovery forms use, so the console
	 * looks accounts up under the spelling they were stored with.
	 */
	protected async resolveEmail(providedEmail?: string): Promise<string> {
		const typedEmail = providedEmail ?? (await this.prompt.ask(EMAIL_PROMPT));
		const { email } = await emailAddressValidator.validate({
			email: typedEmail,
		});

		return email;
	}

	/**
	 * The account behind an address, or `null` once the reason has been
	 * reported. Callers guard on it rather than passing a user that may not
	 * exist any further.
	 */
	protected async loadAccount(providedEmail?: string): Promise<User | null> {
		const email = await this.resolveEmail(providedEmail);
		const account = await User.findBy('email', email);

		if (!account) {
			this.fail(`No account on this instance answers to ${email}`);

			return null;
		}

		return account;
	}

	protected fail(message: string): void {
		this.logger.error(message);
		this.exitCode = FAILURE_EXIT_CODE;
	}
}

/**
 * VineJS hands its messages over as `any`. Narrowing them here is what lets
 * the reporter above print them without the command trusting a shape it never
 * checked.
 */
function toValidationMessages(messages: unknown): readonly ValidationMessage[] {
	if (!Array.isArray(messages)) return [];

	return messages.filter(isValidationMessage);
}

function isValidationMessage(message: unknown): message is ValidationMessage {
	if (typeof message !== 'object' || message === null) return false;
	if (!('message' in message)) return false;

	return typeof message.message === 'string';
}
