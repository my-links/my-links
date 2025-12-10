import { Collection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormLink } from '~/components/form/form_link';
import useSearchParam from '~/hooks/use_search_param';
import { isValidHttpUrl } from '~/lib/navigation';

interface CreateLinkPageProps {
	collections: Collection[];
}

export default function CreateLinkPage({ collections }: CreateLinkPageProps) {
	const { t } = useTranslation('common');
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

	const handleSubmit = () => {
		const { method, url } = route('link.create');
		submit(method, url);
	};

	return (
		<FormLink
			title={t('link.create')}
			textSubmitButton={t('form.create')}
			canSubmit={canSubmit}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			collections={collections}
		/>
	);
}
