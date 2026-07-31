import { inject } from '@adonisjs/core';
import { args, flags } from '@adonisjs/core/ace';

import AccountCommand from '#commands/_account_command';
import { UserService } from '#services/user/user_service';
import { accountRoleValidator } from '#validators/admin/account_role_validator';
import {
	ACCOUNT_ROLE,
	ACCOUNT_ROLES,
	type AccountRole,
} from '#constants/account';

export const ROLE_PROMPT = 'Role';

export default class SetUserRole extends AccountCommand {
	static commandName = 'user:set-role';
	static description = 'Promote an account to administrator, or demote it';

	@args.string({ description: 'Email address of the account', required: false })
	declare email?: string;

	@flags.string({
		description: `Role to give the account: ${ACCOUNT_ROLES.join(' or ')}`,
	})
	declare role?: string;

	@inject()
	async run(userService: UserService): Promise<void> {
		const account = await this.loadAccount(this.email);
		if (!account) return;

		const role = await this.resolveRole();

		if (role === ACCOUNT_ROLE.ADMINISTRATOR) {
			await userService.promoteToAdministrator(account);
		} else {
			await userService.demoteToMember(account);
		}

		this.logger.success(`${account.email} is now ${role}`);
	}

	private async resolveRole(): Promise<AccountRole> {
		if (!this.role) return this.prompt.choice(ROLE_PROMPT, ACCOUNT_ROLES);

		const { role } = await accountRoleValidator.validate({ role: this.role });

		return role;
	}
}
