import { Exception } from '@adonisjs/core/exceptions';

export default class IncompleteGoogleAuthConfigException extends Exception {
	static status = 500;
	static code = 'E_INCOMPLETE_GOOGLE_AUTH_CONFIG';

	constructor(missingVariableName: string) {
		super(
			`Google authentication is partially configured: ${missingVariableName} is missing. ` +
				'Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it, or leave both empty to disable it.',
			{
				status: 500,
				code: 'E_INCOMPLETE_GOOGLE_AUTH_CONFIG',
			}
		);
	}
}
