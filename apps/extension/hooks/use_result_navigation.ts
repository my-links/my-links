import { useEffect, useRef, useState, type RefObject } from 'react';

import {
	FIRST_RESULT_INDEX,
	nextResultIndex,
	previousResultIndex,
} from '@/lib/search/result_list';

interface UseResultNavigationReturn {
	selectedIndex: number;
	resultsRef: RefObject<HTMLDivElement | null>;
}

function findResultElement(
	container: HTMLDivElement | null,
	index: number
): HTMLElement | null {
	return (
		container?.querySelector<HTMLElement>(`[data-result-index="${index}"]`) ??
		null
	);
}

/**
 * Arrow-key selection over the rendered result list, with Enter activating the
 * selection. Activation clicks the rendered element rather than rebuilding its
 * destination, so anchors keep their `target`/`rel` semantics and rows without
 * a destination stay inert.
 */
export function useResultNavigation(
	results: readonly unknown[]
): UseResultNavigationReturn {
	const [selectedIndex, setSelectedIndex] = useState(FIRST_RESULT_INDEX);
	const resultsRef = useRef<HTMLDivElement>(null);
	const resultCount = results.length;

	useEffect(() => {
		setSelectedIndex(FIRST_RESULT_INDEX);
	}, [results]);

	useEffect(() => {
		if (resultCount === 0) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				setSelectedIndex((current) => nextResultIndex(current, resultCount));
				return;
			}

			if (event.key === 'ArrowUp') {
				event.preventDefault();
				setSelectedIndex(previousResultIndex);
				return;
			}

			if (
				event.key === 'Enter' &&
				!(event.target instanceof HTMLButtonElement)
			) {
				event.preventDefault();
				findResultElement(resultsRef.current, selectedIndex)?.click();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [resultCount, selectedIndex]);

	useEffect(() => {
		findResultElement(resultsRef.current, selectedIndex)?.scrollIntoView({
			block: 'nearest',
		});
	}, [selectedIndex, resultCount]);

	return { selectedIndex, resultsRef };
}
