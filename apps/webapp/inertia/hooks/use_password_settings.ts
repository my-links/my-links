import { usePage } from '@inertiajs/react';

type PasswordSettings = {
	hasPassword: boolean;
	minimumPasswordLength: number;
};

/**
 * Both values come from the server: which form to render is a fact about the
 * account, and the minimum length is the rule the submission will be judged
 * by — a copy of it in the page would eventually disagree with the validator.
 */
export const usePasswordSettings = (): PasswordSettings =>
	usePage<PasswordSettings>().props;
