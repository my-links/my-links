import { usePage } from '@inertiajs/react';

type EmailSettings = {
	emailAddress: string;
	canChangeEmail: boolean;
};

/**
 * Both values come from the server: the address is what the account is stored
 * under, and whether it can be moved is a capability of the instance rather
 * than a choice the page gets to make.
 */
export const useEmailSettings = (): EmailSettings =>
	usePage<EmailSettings>().props;
