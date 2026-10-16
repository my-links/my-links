import type { Data } from '@generated/data';
import { router, usePage } from '@inertiajs/react';

export function useSessions() {
	const {
		props: { sessions },
	} = usePage<{
		sessions: Data.UserSession[];
	}>();

	const revokeSession = (publicId: string) =>
		router.delete(`/user/sessions/${publicId}`);

	return {
		sessions,
		revokeSession,
	};
}
