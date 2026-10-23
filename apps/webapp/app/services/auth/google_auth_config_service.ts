import { resolveGoogleAuthConfig } from '#lib/auth/google_config';
import env from '#start/env';

export class GoogleAuthConfigService {
	get isEnabled(): boolean {
		return resolveGoogleAuthConfig(
			env.get('GOOGLE_CLIENT_ID'),
			env.get('GOOGLE_CLIENT_SECRET')
		).isEnabled;
	}
}
