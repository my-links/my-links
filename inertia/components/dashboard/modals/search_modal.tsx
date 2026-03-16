import { Data } from '@generated/data';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, Input } from '@minimalstuff/ui';
import { Route } from '@tuyau/core/types';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SearchCollectionResults } from '~/components/dashboard/search/search_collection_results';
import { SearchLinkResults } from '~/components/dashboard/search/search_link_results';
import useShortcut, { UseShortcutProps } from '~/hooks/use_shortcut';
import { tuyauClient } from '~/lib/tuyau';

const SEARCH_DEBOUNCE_DELAY = 300;
const DEFAULT_INDEX = 0;

type SearchResultType = 'link' | 'collection' | 'both';

interface SearchModalProps {
	onClose: () => void;
}

export function SearchModal({ onClose }: Readonly<SearchModalProps>) {
	const [searchTerm, setSearchTerm] = useState('');
	const [searchType, setSearchType] = useState<SearchResultType>('both');
	const [results, setResults] = useState<Data.SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const resultsRef = useRef<HTMLDivElement>(null);
	const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const performSearch = useCallback(async () => {
		setIsLoading(true);

		try {
			const { data } = await tuyauClient.get('/search', {
				query: {
					term: searchTerm,
					type: searchType,
				},
			});
			setResults(Array.isArray(data) ? data : []);
			setSelectedIndex(DEFAULT_INDEX);
		} catch (e) {
			const error = e as Route.Error<'search'>;
			console.error('Search error:', error);
			setResults([]);
			setSelectedIndex(DEFAULT_INDEX);
		} finally {
			setIsLoading(false);
		}
	}, [searchTerm, searchType]);

	useEffect(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		if (searchTerm.trim().length === 0) {
			setResults([]);
			setSelectedIndex(DEFAULT_INDEX);
			return;
		}

		debounceTimerRef.current = setTimeout(() => {
			performSearch();
		}, SEARCH_DEBOUNCE_DELAY);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [searchTerm, searchType]);

	const linkResults = useMemo(
		() => results.filter((r) => r.type === 'link'),
		[results]
	);

	const collectionResults = useMemo(
		() => results.filter((r) => r.type === 'collection'),
		[results]
	);

	const handleResultClick = useCallback(
		(result: Data.SearchResult) => {
			if (result.type === 'link' && result.url) {
				window.open(result.url, '_blank', 'noopener,noreferrer');
			} else if (result.type === 'collection') {
				router.visit(`/collections/${result.id}`);
			}
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

		if (searchTerm.trim().length === 0) {
			return (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					<Trans>Start typing to search...</Trans>
				</div>
			);
		}

		if (results.length === 0) {
			return (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					<Trans>No results found</Trans>
				</div>
			);
		}

		return (
			<>
				<SearchLinkResults
					linkResults={linkResults}
					selectedIndex={selectedIndex}
					handleResultClick={handleResultClick}
					searchTerm={searchTerm}
				/>

				<SearchCollectionResults
					collectionResults={collectionResults}
					linkResultsLength={linkResults.length}
					selectedIndex={selectedIndex}
					handleResultClick={handleResultClick}
					searchTerm={searchTerm}
				/>
			</>
		);
	}, [
		collectionResults,
		handleResultClick,
		searchTerm,
		isLoading,
		linkResults,
		results.length,
		selectedIndex,
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
		() => results[selectedIndex] && handleResultClick(results[selectedIndex]),
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
			<div className="space-y-3">
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

				<div className="flex items-center gap-2">
					<Button
						variant={searchType === 'both' ? 'primary' : 'secondary'}
						size="sm"
						onClick={() => setSearchType('both')}
						className={clsx(
							searchType !== 'both' &&
								'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
						)}
					>
						<Trans>All</Trans>
					</Button>
					<Button
						variant={searchType === 'link' ? 'primary' : 'secondary'}
						size="sm"
						onClick={() => setSearchType('link')}
						className={clsx(
							searchType !== 'link' &&
								'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
						)}
					>
						<Trans>Links</Trans>
					</Button>
					<Button
						variant={searchType === 'collection' ? 'primary' : 'secondary'}
						size="sm"
						onClick={() => setSearchType('collection')}
						className={clsx(
							searchType !== 'collection' &&
								'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
						)}
					>
						<Trans>Collections</Trans>
					</Button>
				</div>
			</div>

			<div ref={resultsRef} className="max-h-96 overflow-y-auto space-y-4">
				{resultsContent}
			</div>
		</div>
	);
}
