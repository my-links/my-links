import '@adonisjs/inertia/types';

import type React from 'react';
import type { Prettify } from '@adonisjs/core/types/common';

type ExtractProps<T> =
	T extends React.FC<infer Props>
		? Prettify<Omit<Props, 'children'>>
		: T extends React.Component<infer Props>
			? Prettify<Omit<Props, 'children'>>
			: never;

declare module '@adonisjs/inertia/types' {
	export interface InertiaPages {
		'admin/dashboard': ExtractProps<
			(typeof import('../../inertia/pages/admin/dashboard.tsx'))['default']
		>;
		dashboard: ExtractProps<
			(typeof import('../../inertia/pages/dashboard.tsx'))['default']
		>;
		'errors/not_found': ExtractProps<
			(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']
		>;
		'errors/server_error': ExtractProps<
			(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']
		>;
		home: ExtractProps<
			(typeof import('../../inertia/pages/home.tsx'))['default']
		>;
		privacy: ExtractProps<
			(typeof import('../../inertia/pages/privacy.tsx'))['default']
		>;
		shared: ExtractProps<
			(typeof import('../../inertia/pages/shared.tsx'))['default']
		>;
		status: ExtractProps<
			(typeof import('../../inertia/pages/status.tsx'))['default']
		>;
		terms: ExtractProps<
			(typeof import('../../inertia/pages/terms.tsx'))['default']
		>;
		'user_settings/show': ExtractProps<
			(typeof import('../../inertia/pages/user_settings/show.tsx'))['default']
		>;
	}
}
