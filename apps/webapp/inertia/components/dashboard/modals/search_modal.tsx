import { Data } from '@generated/data';
import { Input } from '@minimalstuff/ui';
import { ChangeEvent, useCallback, useState } from 'react';

import { urlFor } from '~/lib/tuyau';
import { useSearchResults } from '~/hooks/use_search_results';
import { useSearchNavigation } from '~/hooks/use_search_navigation';
import { SearchResultsContent } from '~/components/dashboard/search/search_results_content';

type SearchModalProps = {
	onClose: () => void;
};

export function SearchModal({ onClose }: Readonly<SearchModalProps>) {
	const [searchTerm, setSearchTerm] = useState('');
	const { results, isLoading } = useSearchResults(searchTerm);

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

	const { selectedIndex, resultsRef } = useSearchNavigation(
		results,
		handleResultClick
	);

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) =>
		setSearchTerm(event.target.value);

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
						onChange={handleSearchChange}
						placeholder="Search..."
						autoFocus
						className="pl-10"
					/>
				</div>
			</div>

			<div ref={resultsRef} className="space-y-4">
				<SearchResultsContent
					isLoading={isLoading}
					searchTerm={searchTerm}
					results={results}
					selectedIndex={selectedIndex}
					onResultClick={handleResultClick}
					onClose={onClose}
				/>
			</div>
		</div>
	);
}
