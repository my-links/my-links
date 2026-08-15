import { Data } from '@generated/data';
import { Input } from '@minimalstuff/ui';
import { Trans } from '@lingui/react/macro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { tuyauClient, urlFor } from '~/lib/tuyau';
import { matchLinks, type FuzzyMatch } from '~/lib/fuzzy_links';
import useShortcut, { UseShortcutProps } from '~/hooks/use_shortcut';
import { SearchLinkResults } from '~/components/dashboard/search/search_link_results';

const DEFAULT_INDEX = 0;

interface SearchModalProps {
	onClose: () => void;
}

/**
 * The generated tuyau types claim `GET /links` resolves to a bare
 * `Data.Link[]`, but the shared `ApiSerializer` always wraps collections
 * under a `data` key at runtime — this narrows the actual response shape
 * without trusting either side blindly.
 */
function extractLinks(payload: unknown): Data.Link[] {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (
		typeof payload === 'object' &&
		payload !== null &&
		'data' in payload &&
		Array.isArray(payload.data)
	) {
		return payload.data;
	}

	return [];
}

/**
 * When there's no search term yet, show every link sorted by most recent
 * first, rather than an empty "start typing" placeholder.
 */
function toRecentMatches(links: readonly Data.Link[]): FuzzyMatch<Data.Link>[] {
	return [...links]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
		.map((link) => ({ link, nameRanges: [] }));
}

export function SearchModal({ onClose }: Readonly<SearchModalProps>) {
	const [searchTerm, setSearchTerm] = useState('');
	const [links, setLinks] = useState<Data.Link[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedIndex, setSelectedIndex] = useState(DEFAULT_INDEX);
	const resultsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let isMounted = true;

		tuyauClient
			.get('/links', {})
			.then(({ data }) => {
				if (isMounted) {
					setLinks(extractLinks(data));
				}
			})
			.catch(() => {
				if (isMounted) {
					setLinks([]);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const results = useMemo(
		() =>
			searchTerm.trim().length === 0
				? toRecentMatches(links)
				: matchLinks(links, searchTerm),
		[links, searchTerm]
	);

	useEffect(() => {
		setSelectedIndex(DEFAULT_INDEX);
	}, [results]);

	// Opened through the server redirect rather than straight to `link.url`,
	// so a click counts the same here as it does from `LinkItem`.
	const handleResultClick = useCallback(
		(link: Data.Link) => {
			window.open(
				urlFor('link.visit', { id: link.id }),
				'_blank',
				'noopener,noreferrer'
			);
			onClose();
		},
		[onClose]
	);

	const resultsContent = useMemo(() => {
		if (isLoading) {
			return (
				<div className="flex items-center justify-center py-8">
					<div className="i-svg-spinners-3-dots-fade w-6 h-6 text-gray-400" />
				</div>
			);
		}

		if (results.length === 0) {
			return (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					{searchTerm.trim().length === 0 ? (
						<Trans>No links yet</Trans>
					) : (
						<Trans>No results found</Trans>
					)}
				</div>
			);
		}

		return (
			<SearchLinkResults
				results={results}
				selectedIndex={selectedIndex}
				handleResultClick={handleResultClick}
				onCloseModal={onClose}
			/>
		);
	}, [
		isLoading,
		searchTerm,
		results,
		selectedIndex,
		handleResultClick,
		onClose,
	]);

	// Shortcuts to navigate the results
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
		() =>
			results[selectedIndex] && handleResultClick(results[selectedIndex].link),
		commonShortcutOptions
	);

	// Scroll the selected result into view
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

	return (
		<div className="space-y-4">
			<div className="sticky top-0 z-10 pt-1 pb-2 bg-white dark:bg-gray-900">
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
						<div className="i-ion-search w-5 h-5 text-gray-400" />
					</div>
					<Input
						value={searchTerm}
						type="text"
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search..."
						autoFocus
						className="pl-10"
					/>
				</div>
			</div>

			<div ref={resultsRef} className="space-y-4">
				{resultsContent}
			</div>
		</div>
	);
}
