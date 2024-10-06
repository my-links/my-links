import UnstyledList from '~/components/common/unstyled/unstyled_list';
import SearchResultItem from '~/components/dashboard/search/search_result_item';
import useShortcut from '~/hooks/use_shortcut';
import { SearchResult } from '~/types/search';

export default function SearchResultList({
	results,
	selectedItem,
	setSelectedItem,
}: {
	results: SearchResult[];
	selectedItem: SearchResult;
	setSelectedItem: (result: SearchResult) => void;
}) {
	const selectedItemIndex = results.findIndex(
		(item) => item.id === selectedItem.id && item.type === selectedItem.type
	);

	useShortcut(
		'ARROW_UP',
		() => setSelectedItem(results[selectedItemIndex - 1]),
		{
			enabled: results.length > 1 && selectedItemIndex !== 0,
			disableGlobalCheck: true,
		}
	);
	useShortcut(
		'ARROW_DOWN',
		() => setSelectedItem(results[selectedItemIndex + 1]),
		{
			enabled: results.length > 1 && selectedItemIndex !== results.length - 1,
			disableGlobalCheck: true,
		}
	);

	return (
		<UnstyledList css={{ maxHeight: '500px', overflow: 'auto' }}>
			{results.map((result) => (
				<SearchResultItem
					result={result}
					onHover={setSelectedItem}
					isActive={
						selectedItem &&
						selectedItem.id === result.id &&
						selectedItem.type === result.type
					}
					key={result.type + result.id.toString()}
				/>
			))}
		</UnstyledList>
	);
}
