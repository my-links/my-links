import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';

type AuthMethods = {
	hasPassword: boolean;
	linkedProviders: Data.OauthAuth[];
	canUnlinkProvider: boolean;
};

/**
 * Every value comes from the server: which methods an account owns is a fact
 * about it, and whether one of them can be removed is the very rule the unlink
 * endpoint enforces — recomputing it here is how a page ends up offering an
 * action the service refuses.
 */
export const useAuthMethods = (): AuthMethods => usePage<AuthMethods>().props;
