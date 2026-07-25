import { useEffect, useRef, type RefObject } from 'react';

import {
	consumeSearchFocusRequest,
	isSearchFocusRequestFresh,
	searchFocusRequestStorage,
} from '@/lib/search/focus_request';

/**
 * Ref to hand to the search input so the `open-search` keyboard shortcut can
 * land the caret in it — whether the shortcut is what opened this page, or it
 * was already open and in front.
 */
export function useSearchFocus(): RefObject<HTMLInputElement | null> {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const focusSearchInput = () => {
			inputRef.current?.focus();
			inputRef.current?.select();
		};

		void consumeSearchFocusRequest().then((isRequested) => {
			if (isRequested) {
				focusSearchInput();
			}
		});

		return searchFocusRequestStorage.watch((requestedAt) => {
			if (isSearchFocusRequestFresh(requestedAt)) {
				focusSearchInput();
			}
		});
	}, []);

	return inputRef;
}
