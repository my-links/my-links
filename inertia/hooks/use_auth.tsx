import { UserAuth } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

const useAuth = (): UserAuth => usePage<PageProps>().props.auth as UserAuth;
const withAuth = <T extends object>(
	Component: React.ComponentType<T & { auth: UserAuth }>
) => {
	return (props: T) => {
		const auth = useAuth();
		return <Component {...props} auth={auth} />;
	};
};

export { useAuth, withAuth };
