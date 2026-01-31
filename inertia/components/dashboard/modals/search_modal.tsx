import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input } from '@minimalstuff/ui';
import { SearchCollectionResults } from '~/components/dashboard/search/search_collection_results';
import { SearchLinkResults } from '~/components/dashboard/search/search_link_results';
import useShortcut from '~/hooks/use_shortcut';
import { makeRequestWithCredentials } from '~/lib/request';
import { useRouteHelper } from '~/lib/route_helper';

type SearchResultType = 'link' | 'collection' | 'both';

export interface SearchResult {
	id: number;
	type: 'link' | 'collection';
	name: string;
	url: string | null;
	collectionId: number | null;
	icon: string | null;
	matchedPart: string | null;
	rank: number | null;
}

interface SearchModalProps {
	onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [searchType, setSearchType] = useState<SearchResultType>('both');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	const { route } = useRouteHelper();

	const performSearch = async () => {
		if (searchTerm.trim().length === 0) {
			setResults([]);
			setSelectedIndex(-1);
			return;
		}

		setIsLoading(true);

		try {
			const searchUrl = route('search', {
				qs: {
					term: searchTerm.trim(),
					type: searchType,
				},
			}).url;

			const response = await makeRequestWithCredentials(searchUrl, {
				method: 'GET',
			});

			if (response.ok) {
				const data = await response.json();
				setResults(data.results ?? []);
			} else {
				setResults([]);
			}
		} catch (error) {
			console.error('Search error:', error);
			setResults([]);
		} finally {
			setIsLoading(false);
			setSelectedIndex(-1);
		}
	};

	// Debouncer
	useEffect(() => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		if (searchTerm.trim().length === 0) {
			setResults([]);
			setSelectedIndex(-1);
			return;
		}

		debounceTimerRef.current = setTimeout(() => {
			performSearch();
		}, 300);

		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [searchTerm, searchType]);

	const linkResults = results.filter((r) => r.type === 'link');
	const collectionResults = results.filter((r) => r.type === 'collection');

	const handleResultClick = useCallback(
		(result: SearchResult) => {
			if (result.type === 'link' && result.url) {
				window.open(result.url, '_blank', 'noopener,noreferrer');
			} else if (result.type === 'collection') {
				router.visit(`/collections/${result.id}`);
			}
			onClose();
		},
		[onClose]
	);

	// Shortcuts to navigate the results
	const commonShortcutOptions = {
		disableGlobalCheck: true,
		enabled: results.length > 0,
	};

	useShortcut(
		'ARROW_DOWN',
		() =>
			setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev)),
		commonShortcutOptions
	);

	useShortcut(
		'ARROW_UP',
		() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1)),
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
						className={
							searchType !== 'both'
								? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
								: ''
						}
					>
						<Trans>All</Trans>
					</Button>
					<Button
						variant={searchType === 'link' ? 'primary' : 'secondary'}
						size="sm"
						onClick={() => setSearchType('link')}
						className={
							searchType !== 'link'
								? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
								: ''
						}
					>
						<Trans>Links</Trans>
					</Button>
					<Button
						variant={searchType === 'collection' ? 'primary' : 'secondary'}
						size="sm"
						onClick={() => setSearchType('collection')}
						className={
							searchType !== 'collection'
								? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
								: ''
						}
					>
						<Trans>Collections</Trans>
					</Button>
				</div>
			</div>

			<div ref={resultsRef} className="max-h-96 overflow-y-auto space-y-4">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<div className="i-svg-spinners-3-dots-fade w-6 h-6 text-gray-400" />
					</div>
				) : searchTerm.trim().length === 0 ? (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						<Trans>Start typing to search...</Trans>
					</div>
				) : results.length === 0 ? (
					<div className="text-center py-8 text-gray-500 dark:text-gray-400">
						<Trans>No results found</Trans>
					</div>
				) : (
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
				)}
			</div>
		</div>
	);
}
