import { Exception } from '@adonisjs/core/exceptions';

export default class IncompleteMailConfigException extends Exception {
	static status = 500;
	static code = 'E_INCOMPLETE_MAIL_CONFIG';

	constructor(missingVariableName: string) {
		super(
			`Outgoing mail is partially configured: ${missingVariableName} is missing. ` +
				'Set at least SMTP_HOST and MAIL_FROM_ADDRESS to enable it, or leave every SMTP_* and MAIL_* variable empty to disable it.',
			{
				status: 500,
				code: 'E_INCOMPLETE_MAIL_CONFIG',
			}
		);
	}
}
