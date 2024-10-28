import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormLink from '~/components/form/form_link';
import useSearchParam from '~/hooks/use_search_param';
import { isValidHttpUrl } from '~/lib/navigation';
import { tuyau } from '~/lib/tuyau';
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
		const { method, path } = tuyau.$route('link.create');
		submit(method.at(0) as any, path);
	};

	return (
		<FormLink
			title={t('link.create')}
			canSubmit={canSubmit}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			collections={collections}
		/>
	);
}
