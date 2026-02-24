// Source https://github.com/gfmio/react-client-only/blob/master/index.ts#L14-L23

import { useEffect, useState } from 'react';

/** React hook that returns true if the component has mounted client-side */
export const useClientOnly = () => {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	return hasMounted;
};
export const withClientOnly = <T extends object>(
	Component: React.ComponentType<T>
): React.ComponentType<T> => {
	return (props: T) => {
		const clientOnly = useClientOnly();
		return clientOnly ? <Component {...props} /> : null;
	};
};
