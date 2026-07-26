import IncompleteMailConfigException from '#exceptions/mail/incomplete_mail_config_exception';

const SUBMISSION_SMTP_PORT = 587;
const IMPLICIT_TLS_SMTP_PORT = 465;
const DEFAULT_MAIL_FROM_NAME = 'MyLinks';

export type MailSettings = {
	readonly host: string | undefined;
	readonly port: number | undefined;
	readonly username: string | undefined;
	readonly password: string | undefined;
	readonly isSecure: boolean | undefined;
	readonly fromAddress: string | undefined;
	readonly fromName: string | undefined;
};

export type SmtpCredentials = {
	readonly user: string;
	readonly password: string;
};

export type MailSender = {
	readonly address: string;
	readonly name: string;
};

export type MailConfig =
	| {
			readonly isEnabled: true;
			readonly host: string;
			readonly port: number;
			readonly isSecure: boolean;
			readonly credentials: SmtpCredentials | null;
			readonly from: MailSender;
	  }
	| { readonly isEnabled: false };

/**
 * Resolves the SMTP settings into an explicit enabled/disabled state.
 *
 * An instance with no mail at all is a supported deployment — self-hosters get
 * account recovery through the ace commands instead. What is never supported is
 * a half-filled configuration: it would boot, look healthy, and silently drop
 * the one email a locked-out user is waiting for. Any single mail setting
 * therefore commits the operator to a complete one.
 */
export function resolveMailConfig(rawSettings: MailSettings): MailConfig {
	const settings = withoutBlankSettings(rawSettings);

	if (!hasAnyMailSetting(settings)) {
		return { isEnabled: false };
	}

	const host = requireSetting(settings.host, 'SMTP_HOST');
	const fromAddress = requireSetting(settings.fromAddress, 'MAIL_FROM_ADDRESS');
	const port = settings.port ?? SUBMISSION_SMTP_PORT;

	return {
		isEnabled: true,
		host,
		port,
		isSecure: settings.isSecure ?? port === IMPLICIT_TLS_SMTP_PORT,
		credentials: resolveSmtpCredentials(settings),
		from: {
			address: fromAddress,
			name: settings.fromName ?? DEFAULT_MAIL_FROM_NAME,
		},
	};
}

/**
 * A variable the operator deleted and one they emptied say the same thing, and
 * which of the two reaches this function depends on the env file. Collapsing
 * them here is what lets the rest of the resolution read as plain `??`.
 */
function withoutBlankSettings(settings: MailSettings): MailSettings {
	return {
		...settings,
		host: undefinedWhenBlank(settings.host),
		username: undefinedWhenBlank(settings.username),
		password: undefinedWhenBlank(settings.password),
		fromAddress: undefinedWhenBlank(settings.fromAddress),
		fromName: undefinedWhenBlank(settings.fromName),
	};
}

function undefinedWhenBlank(setting: string | undefined): string | undefined {
	return setting === '' ? undefined : setting;
}

function hasAnyMailSetting(settings: MailSettings): boolean {
	return Object.values(settings).some((setting) => setting !== undefined);
}

/**
 * Authentication is optional — a relay reachable only from the compose network
 * has no reason to ask for credentials — but half of it is not.
 */
function resolveSmtpCredentials({
	username,
	password,
}: MailSettings): SmtpCredentials | null {
	if (username === undefined && password === undefined) {
		return null;
	}

	return {
		user: requireSetting(username, 'SMTP_USERNAME'),
		password: requireSetting(password, 'SMTP_PASSWORD'),
	};
}

function requireSetting(
	setting: string | undefined,
	variableName: string
): string {
	if (setting === undefined) {
		throw new IncompleteMailConfigException(variableName);
	}

	return setting;
}
