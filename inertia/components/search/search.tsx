import { router } from '@inertiajs/react';
import { rem } from '@mantine/core';
import { Spotlight, SpotlightActionData } from '@mantine/spotlight';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LinkFavicon from '~/components/dashboard/link/item/favicon/link_favicon';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { appendCollectionId } from '~/lib/navigation';
import { makeRequest } from '~/lib/request';
import type { SearchResult } from '~/types/search';

interface SearchSpotlightProps {
	openCallback?: () => void;
	closeCallback?: () => void;
}

export function SearchSpotlight({
	openCallback,
	closeCallback,
}: SearchSpotlightProps) {
	const { t } = useTranslation('common');
	const tuyau = useTuyauRequired();

	const [searchTerm, setSearchTerm] = useState<string>('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (searchTerm.trim() === '') {
			return setResults([]);
		}

		setLoading(true);
		const controller = new AbortController();
		const routeInfo = tuyau.$route('search');
		if (!routeInfo) {
			throw new Error('Route search not found');
		}
		const url = `${routeInfo.path}?term=${encodeURIComponent(searchTerm)}`;
		makeRequest({
			method: routeInfo.method,
			url,
			controller,
		})
			.then(({ results: _results }) => {
				setResults(_results);
				setLoading(false);
			})
			.catch((error) => {
				if (error! instanceof DOMException) {
					setLoading(false);
				}
			});

		return () => {
			controller.abort('Canceled by user');
			setLoading(false);
		};
	}, [searchTerm, tuyau]);

	const handleResultSubmit = (result: SearchResult) => {
		if (result.type === 'collection') {
			return router.visit(
				appendCollectionId(tuyau.$route('dashboard').path, result.id)
			);
		}

		if (result.type === 'link') {
			return window.open(result.url, '_blank');
		}
	};

	const actions: SpotlightActionData[] = results.map((result) => ({
		id: `${result.id.toString()}${result.type}`,
		label: result.name,
		description: result.description,
		onClick: () => handleResultSubmit(result),
		leftSection:
			result.type === 'collection' ? (
				<div
					className="i-ant-design-folder-outlined"
					style={{ width: rem(24), height: rem(24) }}
				/>
			) : (
				<LinkFavicon url={result.url} size={24} />
			),
	}));

	const spotlightPromptText = loading
		? t('loading')
		: searchTerm.trim() === ''
			? t('search')
			: t('no-results');

	return (
		<Spotlight
			actions={actions}
			nothingFound={spotlightPromptText}
			highlightQuery
			searchProps={{
				leftSection: (
					<div
						className="i-tabler-search"
						style={{ width: rem(20), height: rem(20) }}
					/>
				),
				placeholder: t('search'),
			}}
			onQueryChange={(query) => setSearchTerm(query)}
			onSpotlightOpen={openCallback}
			onSpotlightClose={closeCallback}
			clearQueryOnClose
			closeOnActionTrigger
		/>
	);
}
