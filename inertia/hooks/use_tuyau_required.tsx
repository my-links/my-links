import { useTuyau } from '@tuyau/inertia/react';

export const useTuyauRequired = () => {
	const tuyau = useTuyau();
	if (!tuyau) {
		throw new Error('Tuyau client is not available');
	}
	return tuyau;
};
