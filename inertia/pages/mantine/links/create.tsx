import { useForm } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSearchParam from '~/hooks/use_search_param';
import { isValidHttpUrl } from '~/lib/navigation';
import MantineFormLink from '~/mantine/components/form/mantine_form_link';
import { Collection } from '~/types/app';

export default function CreateLinkPage({
	collections,
}: {
	collections: Collection[];
}) {
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
		<MantineFormLink
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
