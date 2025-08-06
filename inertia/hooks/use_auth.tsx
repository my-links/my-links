import { usePage } from '@inertiajs/react';
import type { Auth, InertiaPage } from '~/types/inertia';

export const useAuth = () => usePage<InertiaPage>().props.auth;

export const withAuth = <T extends object>(
	Component: React.ComponentType<T & { auth: Auth }>
): React.ComponentType<Omit<T, 'auth'>> => {
	return (props: Omit<T, 'auth'>) => {
		const auth = useAuth();
		return <Component {...(props as T)} auth={auth} />;
	};
};

export const withAuthRequired = <T extends object>(
	Component: React.ComponentType<T & { auth: Auth }>
): React.ComponentType<Omit<T, 'auth'>> => {
	return (props: Omit<T, 'auth'>) => {
		const auth = useAuth();
		if (!auth.isAuthenticated) {
			return null;
		}
		return <Component {...(props as T)} auth={auth} />;
	};
};
