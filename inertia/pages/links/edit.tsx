import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormLink from '~/components/form/form_link';
import { isValidHttpUrl } from '~/lib/navigation';
import { tuyau } from '~/lib/tuyau';
import { Collection, Link } from '~/types/app';

export default function EditLinkPage({
	collections,
	link,
}: {
	collections: Collection[];
	link: Link;
}) {
	const { t } = useTranslation('common');
	const { data, setData, submit, processing } = useForm({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionId: link.collectionId,
	});
	const canSubmit = useMemo<boolean>(() => {
		const isFormEdited =
			data.name !== link.name ||
			data.url !== link.url ||
			data.description !== link.description ||
			data.favorite !== link.favorite ||
			data.collectionId !== link.collectionId;

		const isFormValid =
			data.name !== '' &&
			isValidHttpUrl(data.url) &&
			data.favorite !== null &&
			data.collectionId !== null;

		return isFormEdited && isFormValid && !processing;
	}, [data, processing]);

	const handleSubmit = () => {
		const { method, path } = tuyau.$route('link.edit', {
			id: link.id.toString(),
		});
		submit(method.at(0) as any, path);
	};

	return (
		<FormLink
			title={t('link.edit')}
			canSubmit={canSubmit}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			collections={collections}
		/>
	);
}
