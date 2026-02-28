import { createElement, Fragment } from 'react';
import { useClientOnly } from '~/hooks/use_client_only';

interface ClientOnlyProps extends React.PropsWithChildren {
	fallback?: React.ReactNode;
}

export function ClientOnly({ children, fallback }: Readonly<ClientOnlyProps>) {
	const hasMounted = useClientOnly();

	if (!hasMounted) {
		return fallback ?? null;
	}

	return createElement(Fragment, { children });
}
