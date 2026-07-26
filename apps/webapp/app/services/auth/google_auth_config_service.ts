import env from '#start/env';
import { resolveGoogleAuthConfig } from '#lib/auth/google_config';

export class GoogleAuthConfigService {
	get isEnabled(): boolean {
		return resolveGoogleAuthConfig(
			env.get('GOOGLE_CLIENT_ID'),
			env.get('GOOGLE_CLIENT_SECRET')
		).isEnabled;
	}
}
