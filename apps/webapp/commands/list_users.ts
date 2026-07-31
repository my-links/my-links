import { inject } from '@adonisjs/core';
import { flags } from '@adonisjs/core/ace';

import type User from '#models/user';
import { ACCOUNT_ROLE } from '#constants/account';
import type { AuthProvider } from '#constants/auth';
import AccountCommand from '#commands/_account_command';
import { UserService, type AccountFilters } from '#services/user/user_service';
import { authProviderValidator } from '#validators/auth/auth_provider_validator';

export const NO_ACCOUNT_MESSAGE = 'This instance holds no account yet';
export const NO_MATCHING_ACCOUNT_MESSAGE = 'No account matches these filters';

const TABLE_HEAD = ['Email', 'Name', 'Role', 'Address', 'Sign-in methods'];
const NO_METHOD = 'none';
const CONFIRMED = 'confirmed';
const UNCONFIRMED = 'unconfirmed';

export default class ListUsers extends AccountCommand {
	static commandName = 'user:list';
	static description = 'List the accounts of this instance';

	@flags.boolean({ description: 'Keep only the administrators' })
	declare admin?: boolean;

	@flags.boolean({ description: 'Keep only the unconfirmed addresses' })
	declare unverified?: boolean;

	@flags.string({ description: 'Keep only the accounts linked to a provider' })
	declare provider?: string;

	@inject()
	async run(userService: UserService): Promise<void> {
		const filters = {
			administratorsOnly: this.admin === true,
			unverifiedOnly: this.unverified === true,
			provider: await this.resolveProvider(),
		};
		const accounts = await userService.listAccounts(filters);

		if (accounts.length === 0) {
			this.logger.info(emptyListingMessage(filters));

			return;
		}

		const table = this.ui.table().head(TABLE_HEAD);
		accounts.forEach((account) => table.row(describeAccount(account)));
		table.render();
	}

	/**
	 * Validated through the same enum the unlink route reads, so a provider
	 * this instance has never heard of is refused here rather than quietly
	 * returning an empty listing.
	 */
	private async resolveProvider(): Promise<AuthProvider | null> {
		if (!this.provider) return null;

		const { provider } = await authProviderValidator.validate({
			provider: this.provider,
		});

		return provider;
	}
}

/**
 * An empty listing means two very different things, and saying the wrong one
 * sends an operator looking for accounts that are right there behind a filter.
 */
function emptyListingMessage({
	administratorsOnly,
	unverifiedOnly,
	provider,
}: AccountFilters): string {
	const isFiltered = administratorsOnly || unverifiedOnly || provider !== null;

	return isFiltered ? NO_MATCHING_ACCOUNT_MESSAGE : NO_ACCOUNT_MESSAGE;
}

function describeAccount(account: User): string[] {
	return [
		account.email,
		account.name,
		account.isAdmin ? ACCOUNT_ROLE.ADMINISTRATOR : ACCOUNT_ROLE.MEMBER,
		account.emailVerifiedAt ? CONFIRMED : UNCONFIRMED,
		describeAuthMethods(account),
	];
}

/**
 * Read off the relations the listing preloaded — the point of the whole
 * command is answering "how does this person get in", and an account with no
 * answer at all is the row an operator most needs to see.
 */
function describeAuthMethods(account: User): string {
	const methods = [
		...(account.passwordAuth ? ['password'] : []),
		...account.oauthAuths.map((oauthAuth) => oauthAuth.provider),
	];

	return methods.length > 0 ? methods.join(', ') : NO_METHOD;
}
