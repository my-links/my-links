import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';

import type { KEYS } from '~/consts/keys';

interface Shortcut {
	keys: readonly (keyof typeof KEYS)[];
	label: ReactNode;
}

interface ShortcutSection {
	id: string;
	title: ReactNode;
	shortcuts: readonly Shortcut[];
}

// Kept apart from `KEYS`, which also holds internal key names the user never
// presses as a shortcut. Referencing its entries keeps the combos shown here
// tied to the ones `use_shortcut.ts` listens for.
export const SHORTCUT_SECTIONS: readonly ShortcutSection[] = [
	{
		id: 'dashboard',
		title: <Trans>Dashboard</Trans>,
		shortcuts: [
			{ keys: ['OPEN_SEARCH_KEY'], label: <Trans>Open search</Trans> },
			{ keys: ['OPEN_CREATE_LINK_KEY'], label: <Trans>Create a link</Trans> },
			{
				keys: ['OPEN_CREATE_COLLECTION_KEY'],
				label: <Trans>Create a collection</Trans>,
			},
		],
	},
	{
		id: 'search',
		title: <Trans>In search</Trans>,
		shortcuts: [
			{
				keys: ['ARROW_UP', 'ARROW_DOWN'],
				label: <Trans>Move through results</Trans>,
			},
			{ keys: ['ENTER_KEY'], label: <Trans>Open the selected link</Trans> },
			{ keys: ['ESCAPE_KEY'], label: <Trans>Close search</Trans> },
		],
	},
];
