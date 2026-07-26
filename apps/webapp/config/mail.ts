import type { SMTPConfig } from '@adonisjs/mail/types';
import { defineConfig, transports } from '@adonisjs/mail';

import env from '#start/env';
import { resolveMailConfig, type MailConfig } from '#lib/mail/mail_config';

const BRAND_NAME = 'MyLinks';

/**
 * The transport is built even when mail is disabled, so the config shape — and
 * the types generated from it — stay identical across deployments. Nothing ever
 * reaches this host: `MailService` drops every message before the mailer sees
 * it.
 */
const UNREACHABLE_SMTP_HOST = 'mail.disabled.invalid';

/**
 * Resolved at boot so a partial configuration crashes the instance
 * immediately, rather than at the first email an operator was counting on.
 */
export const mailConfiguration = resolveMailConfig({
	host: env.get('SMTP_HOST'),
	port: env.get('SMTP_PORT'),
	username: env.get('SMTP_USERNAME'),
	password: env.get('SMTP_PASSWORD'),
	isSecure: env.get('SMTP_SECURE'),
	fromAddress: env.get('MAIL_FROM_ADDRESS'),
	fromName: env.get('MAIL_FROM_NAME'),
});

function buildSmtpTransport(configuration: MailConfig): SMTPConfig {
	if (!configuration.isEnabled) {
		return { host: UNREACHABLE_SMTP_HOST };
	}

	const { host, port, isSecure, credentials } = configuration;

	if (!credentials) {
		return { host, port, secure: isSecure };
	}

	return {
		host,
		port,
		secure: isSecure,
		auth: { type: 'login', user: credentials.user, pass: credentials.password },
	};
}

const mailConfig = defineConfig({
	default: 'smtp',

	from: mailConfiguration.isEnabled ? mailConfiguration.from : undefined,

	/**
	 * Shared with every email template.
	 */
	globals: {
		brandName: BRAND_NAME,
		appUrl: env.get('APP_URL'),
	},

	mailers: {
		smtp: transports.smtp(buildSmtpTransport(mailConfiguration)),
	},
});

export default mailConfig;

declare module '@adonisjs/mail/types' {
	export interface MailersList extends InferMailers<typeof mailConfig> {}
}
