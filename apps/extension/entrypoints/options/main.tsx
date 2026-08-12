import '@minimalstuff/ui/style.css';
import 'virtual:uno.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { RootElementNotFoundError } from '@/lib/mount_app';

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new RootElementNotFoundError();
}

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
