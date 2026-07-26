import { mailConfiguration } from '#config/mail';

/**
 * Injectable view over the boot-time mail configuration, so consumers depend on
 * a capability rather than on the config module.
 */
export class MailConfigService {
	get isEnabled(): boolean {
		return mailConfiguration.isEnabled;
	}
}
