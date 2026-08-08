import { useEffect, useState } from 'react';

import { newTabOverrideStorage } from '@/lib/storage';
import { CollectionsWorkspace } from '@/components/workspace/collections_workspace';

function App() {
	const [isOverrideEnabled, setIsOverrideEnabled] = useState<boolean | null>(
		null
	);

	useEffect(() => {
		void newTabOverrideStorage.getValue().then(setIsOverrideEnabled);
	}, []);

	if (isOverrideEnabled === null) {
		return null;
	}

	if (!isOverrideEnabled) {
		return <main className="min-h-screen bg-white dark:bg-gray-900" />;
	}

	return <CollectionsWorkspace />;
}

export default App;
