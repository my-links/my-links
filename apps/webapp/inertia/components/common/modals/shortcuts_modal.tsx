import type { ReactNode } from 'react';
import { Kbd } from '@minimalstuff/ui';

import type { KEYS } from '~/consts/keys';
import { formatShortcut } from '~/lib/format_shortcut';
import { SHORTCUT_SECTIONS } from '~/consts/shortcuts';

interface ShortcutRowProps {
	keys: readonly (keyof typeof KEYS)[];
	label: ReactNode;
}

const ShortcutRow = ({ keys, label }: Readonly<ShortcutRowProps>) => (
	<div className="flex items-center justify-between gap-4 py-1.5">
		<dt className="text-sm text-gray-700 dark:text-gray-300">{label}</dt>
		<dd className="flex items-center gap-1 shrink-0">
			{keys.flatMap((key) =>
				formatShortcut(key).map((token) => (
					<Kbd key={`${key}-${token}`}>{token}</Kbd>
				))
			)}
		</dd>
	</div>
);

export const ShortcutsModal = () => (
	<div className="space-y-6">
		{SHORTCUT_SECTIONS.map((section) => (
			<section key={section.id}>
				<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
					{section.title}
				</h3>
				<dl className="divide-y divide-gray-100 dark:divide-gray-700">
					{section.shortcuts.map((shortcut) => (
						<ShortcutRow
							key={shortcut.keys.join('+')}
							keys={shortcut.keys}
							label={shortcut.label}
						/>
					))}
				</dl>
			</section>
		))}
	</div>
);
