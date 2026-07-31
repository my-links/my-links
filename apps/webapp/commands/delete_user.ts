import { inject } from '@adonisjs/core';
import { args } from '@adonisjs/core/ace';

import AccountCommand from '#commands/_account_command';
import { UserService } from '#services/user/user_service';

export const DELETION_CONFIRMATION_PROMPT =
	'Retype the email address to confirm the deletion';

export default class DeleteUser extends AccountCommand {
	static commandName = 'user:delete';
	static description = 'Delete an account and everything it owns';

	@args.string({ description: 'Email address of the account', required: false })
	declare email?: string;

	/**
	 * Retyping the address is the whole guard, and there is no flag to skip it:
	 * the account leaves with its links and its collections, and nothing in
	 * this codebase can put them back.
	 */
	@inject()
	async run(userService: UserService): Promise<void> {
		const account = await this.loadAccount(this.email);
		if (!account) return;

		const retypedEmail = await this.prompt.ask(DELETION_CONFIRMATION_PROMPT);
		if (retypedEmail.trim().toLowerCase() !== account.email) {
			this.fail('That address does not match — nothing was deleted');

			return;
		}

		await userService.deleteUser(account.id);

		this.logger.success(`${account.email} and everything it owned are gone`);
	}
}
