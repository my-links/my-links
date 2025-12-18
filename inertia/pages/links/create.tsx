import { Collection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { Trans as TransComponent } from '@lingui/react';
import { FormLink } from '~/components/form/form_link';
import useSearchParam from '~/hooks/use_search_param';
import { isValidHttpUrl } from '~/lib/navigation';
import { useRouteHelper } from '~/lib/route_helper';

interface CreateLinkPageProps {
	collections: Collection[];
}

export default function CreateLinkPage({ collections }: CreateLinkPageProps) {
	const collectionId =
		Number(useSearchParam('collectionId')) ?? collections[0].id;
	const { data, setData, submit, processing } = useForm({
		name: '',
		description: '',
		url: '',
		favorite: false,
		collectionId,
	});
	const canSubmit = useMemo<boolean>(
		() =>
			data.name !== '' &&
			isValidHttpUrl(data.url) &&
			data.favorite !== null &&
			data.collectionId !== null &&
			!processing,
		[data, processing]
	);

	const { route } = useRouteHelper();

	const handleSubmit = () => {
		const { method, url } = route('link.create');
		submit(method, url);
	};

	return (
		<FormLink
			title={<TransComponent id="common:link.create" message="Create a link" />}
			textSubmitButton={
				<TransComponent id="common:form.create" message="Create" />
			}
			canSubmit={canSubmit}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			collections={collections}
		/>
	);
}
