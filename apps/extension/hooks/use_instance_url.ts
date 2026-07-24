import { useEffect, useState } from 'react';

import { instanceUrlStorage } from '@/lib/storage';

export function useInstanceUrl(): string {
	const [instanceUrl, setInstanceUrl] = useState('');

	useEffect(() => {
		void instanceUrlStorage.getValue().then(setInstanceUrl);
		return instanceUrlStorage.watch(setInstanceUrl);
	}, []);

	return instanceUrl;
}
