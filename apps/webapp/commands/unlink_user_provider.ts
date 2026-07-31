import { inject } from '@adonisjs/core';
import { args, flags } from '@adonisjs/core/ace';

import type User from '#models/user';
import AccountCommand from '#commands/_account_command';
import { AUTH_EVENT_TYPE, type AuthProvider } from '#constants/auth';
import { AuthEventService } from '#services/auth/auth_event_service';
import { ProviderLinkService } from '#services/auth/provider_link_service';
import { authProviderValidator } from '#validators/auth/auth_provider_validator';

export const PROVIDER_PROMPT = 'Provider to unlink';

export default class UnlinkUserProvider extends AccountCommand {
	static commandName = 'user:unlink-provider';
	static description = 'Detach a sign-in provider from an account';

	@args.string({ description: 'Email address of the account', required: false })
	declare email?: string;

	@flags.string({ description: 'Provider to detach' })
	declare provider?: string;

	/**
	 * The anti-lockout guard is not restated here: `ProviderLinkService`
	 * refuses to remove the last way into an account, and the console is one
	 * more caller of that rule rather than a way around it.
	 */
	@inject()
	async run(
		providerLinkService: ProviderLinkService,
		authEventService: AuthEventService
	): Promise<void> {
		const account = await this.loadAccount(this.email);
		if (!account) return;

		const provider = await this.resolveProvider(account);
		if (!provider) return;

		await providerLinkService.unlink(account, provider);

		await authEventService.recordConsoleAction(
			AUTH_EVENT_TYPE.PROVIDER_UNLINKED,
			account.id
		);

		this.logger.success(`${provider} is no longer linked to ${account.email}`);
	}

	private async resolveProvider(account: User): Promise<AuthProvider | null> {
		if (this.provider) {
			const { provider } = await authProviderValidator.validate({
				provider: this.provider,
			});

			return provider;
		}

		return this.promptForLinkedProvider(account);
	}

	/**
	 * Only the providers the account actually holds are offered: a list of
	 * everything this codebase can talk to would invite an operator to pick a
	 * link that was never there.
	 */
	private async promptForLinkedProvider(
		account: User
	): Promise<AuthProvider | null> {
		const linkedProviders = await account
			.related('oauthAuths')
			.query()
			.orderBy('linkedAt', 'asc');

		if (linkedProviders.length === 0) {
			this.fail(`${account.email} has no linked provider`);

			return null;
		}

		return this.prompt.choice(
			PROVIDER_PROMPT,
			linkedProviders.map((oauthAuth) => oauthAuth.provider)
		);
	}
}
