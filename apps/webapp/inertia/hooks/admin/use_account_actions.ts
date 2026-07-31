import { router } from '@inertiajs/react';

import { urlFor } from '~/lib/tuyau';

export const ACCOUNT_ROLE = {
	ADMINISTRATOR: 'administrator',
	MEMBER: 'member',
} as const;

export type AccountRole = (typeof ACCOUNT_ROLE)[keyof typeof ACCOUNT_ROLE];

interface UseAccountActionsReturn {
	sendPasswordReset: (accountId: number) => void;
	markEmailConfirmed: (accountId: number) => void;
	revokeAccess: (accountId: number) => void;
	setRole: (accountId: number, role: AccountRole) => void;
}

/**
 * The four things an administrator can do to an account from the table.
 *
 * Every one of them is refused again server-side — this only decides what is
 * offered.
 */
export function useAccountActions(): UseAccountActionsReturn {
	const sendPasswordReset = (accountId: number) =>
		router.post(
			urlFor('admin.users.sendPasswordReset', { id: accountId }),
			{},
			{ preserveScroll: true }
		);

	const markEmailConfirmed = (accountId: number) =>
		router.post(
			urlFor('admin.users.verifyEmail', { id: accountId }),
			{},
			{ preserveScroll: true }
		);

	const revokeAccess = (accountId: number) =>
		router.post(
			urlFor('admin.users.revokeAccess', { id: accountId }),
			{},
			{ preserveScroll: true }
		);

	const setRole = (accountId: number, role: AccountRole) =>
		router.patch(
			urlFor('admin.users.setRole', { id: accountId }),
			{ role },
			{ preserveScroll: true }
		);

	return { sendPasswordReset, markEmailConfirmed, revokeAccess, setRole };
}
