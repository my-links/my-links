import { useEffect } from 'react';

export const useDisableOverflow = () =>
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'auto';
		};
	}, []);
