import { useForm } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MantineFormLink from '~/components/form/form_link';
import { isValidHttpUrl } from '~/lib/navigation';
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
		const trimmedName = data.name.trim();
		const trimmedDescription = data.description?.trim();
		const trimmedUrl = data.url.trim();

		const isFormEdited =
			trimmedName !== link.name ||
			trimmedUrl !== link.url ||
			trimmedDescription !== link.description ||
			data.favorite !== link.favorite ||
			data.collectionId !== link.collectionId;

		const isFormValid =
			trimmedName !== '' &&
			isValidHttpUrl(trimmedUrl) &&
			data.favorite !== null &&
			data.collectionId !== null;

		return isFormEdited && isFormValid && !processing;
	}, [data, processing]);

	const handleSubmit = () => {
		const { method, url } = route('link.edit', {
			params: { id: link.id.toString() },
		});
		submit(method, url);
	};

	return (
		<MantineFormLink
			title={t('link.edit')}
			textSubmitButton={t('form.update')}
			canSubmit={canSubmit}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			collections={collections}
		/>
	);
}
