import { Data } from '@generated/data';
import { useEffect, useRef, useState, type RefObject } from 'react';

import type { FuzzyMatch } from '~/lib/fuzzy_links';
import { useShortcut, UseShortcutProps } from '~/hooks/use_shortcut';

const DEFAULT_INDEX = 0;

type UseSearchNavigationReturn = {
	selectedIndex: number;
	resultsRef: RefObject<HTMLDivElement | null>;
};

export function useSearchNavigation(
	results: FuzzyMatch<Data.Link>[],
	onSelect: (link: Data.Link) => void
): UseSearchNavigationReturn {
	const [selectedIndex, setSelectedIndex] = useState(DEFAULT_INDEX);
	const resultsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setSelectedIndex(DEFAULT_INDEX);
	}, [results]);

	const commonShortcutOptions = {
		disableGlobalCheck: true,
		enabled: results.length > 0,
	} satisfies UseShortcutProps;

	useShortcut(
		'ARROW_DOWN',
		() =>
			setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev)),
		commonShortcutOptions
	);

	useShortcut(
		'ARROW_UP',
		() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : DEFAULT_INDEX)),
		commonShortcutOptions
	);

	useShortcut(
		'ENTER_KEY',
		() => results[selectedIndex] && onSelect(results[selectedIndex].link),
		commonShortcutOptions
	);

	useEffect(() => {
		if (selectedIndex >= 0 && resultsRef.current) {
			const selectedElement = resultsRef.current.querySelector(
				`[data-result-index="${selectedIndex}"]`
			);
			if (selectedElement) {
				selectedElement.scrollIntoView({
					block: 'nearest',
					behavior: 'smooth',
				});
			}
		}
	}, [selectedIndex]);

	return { selectedIndex, resultsRef };
}
