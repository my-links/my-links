import { useForm } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import MantineFormLink from '~/components/form/form_link';
import { LinkWithCollection } from '~/types/app';

export default function DeleteLinkPage({ link }: { link: LinkWithCollection }) {
	const { t } = useTranslation('common');
	const { data, setData, submit, processing } = useForm({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionId: link.collectionId,
	});

	const handleSubmit = () => {
		const { method, url } = route('link.delete', {
			params: { id: link.id.toString() },
		});
		submit(method, url);
	};

	return (
		<MantineFormLink
			title={t('link.delete')}
			textSubmitButton={t('form.delete')}
			canSubmit={!processing}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			collections={[link.collection]}
			disableInputs
			submitBtnDanger
		/>
	);
}
