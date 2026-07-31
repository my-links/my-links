import { inject } from '@adonisjs/core';
import { args, flags } from '@adonisjs/core/ace';

import { AUTH_EVENT_TYPE } from '#constants/auth';
import AccountCommand from '#commands/_account_command';
import { UserService } from '#services/user/user_service';
import { AuthEventService } from '#services/auth/auth_event_service';
import { registerValidator } from '#validators/auth/register_validator';
import { RegistrationService } from '#services/auth/registration_service';

export const DISPLAY_NAME_PROMPT = 'Display name';
export const PASSWORD_PROMPT = 'Password';
export const PASSWORD_CONFIRMATION_PROMPT = 'Confirm the password';
export const ADMINISTRATOR_PROMPT = 'Grant administrator rights?';

export default class CreateUser extends AccountCommand {
	static commandName = 'user:create';
	static description = 'Open an account from the console';

	@args.string({
		description: 'Email address of the new account',
		required: false,
	})
	declare email?: string;

	@flags.string({ description: 'Display name of the new account' })
	declare name?: string;

	@flags.boolean({ description: 'Grant administrator rights' })
	declare admin?: boolean;

	/**
	 * The password is asked for and never read from the CLI: an argument would
	 * be in the shell history and in the process list of every user on the
	 * machine. It is the one answer this command refuses to be scripted.
	 */
	@inject()
	async run(
		registrationService: RegistrationService,
		userService: UserService,
		authEventService: AuthEventService
	): Promise<void> {
		const email = await this.resolveEmail(this.email);

		if (!(await registrationService.isEmailAvailable(email))) {
			this.fail(`${email} already has an account on this instance`);

			return;
		}

		const name = this.name ?? (await this.prompt.ask(DISPLAY_NAME_PROMPT));
		const password = await this.prompt.secure(PASSWORD_PROMPT);
		const passwordConfirmation = await this.prompt.secure(
			PASSWORD_CONFIRMATION_PROMPT
		);
		const isAdmin =
			this.admin ?? (await this.promptForAdministrator(userService));

		const payload = await registerValidator.validate({
			name,
			email,
			password,
			passwordConfirmation,
		});
		const account = await registrationService.provision({
			...payload,
			isAdmin,
		});

		await authEventService.recordConsoleAction(
			AUTH_EVENT_TYPE.REGISTERED,
			account.id
		);

		this.logger.success(
			`${account.email} can now sign in${isAdmin ? ' as an administrator' : ''}`
		);
	}

	/**
	 * Offered as the default on an instance holding no account yet, because
	 * that is the very rule both other creation paths follow: the first account
	 * an instance gets is its administrator.
	 */
	private async promptForAdministrator(
		userService: UserService
	): Promise<boolean> {
		return this.prompt.confirm(ADMINISTRATOR_PROMPT, {
			default: await userService.isNextAccountAdmin(),
		});
	}
}
