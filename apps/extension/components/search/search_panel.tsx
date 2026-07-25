import { useState } from 'react';

import { SearchBar } from './search_bar';
import { SearchResults } from './search_results';
import { useSearchFocus } from '@/hooks/use_search_focus';
import { useDebouncedValue } from '@/hooks/use_debounced_value';
import { CollectionTree } from '@/components/collections/collection_tree';

export function SearchPanel() {
	const [term, setTerm] = useState('');
	const debouncedTerm = useDebouncedValue(term);
	const isSearching = debouncedTerm.trim().length > 0;
	const searchInputRef = useSearchFocus();

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			<SearchBar value={term} onChange={setTerm} inputRef={searchInputRef} />
			{isSearching ? (
				<SearchResults term={debouncedTerm} />
			) : (
				<CollectionTree />
			)}
		</div>
	);
}
