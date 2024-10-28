import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import FormLink from '~/components/form/form_link';
import { tuyau } from '~/lib/tuyau';
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
		const { method, path } = tuyau.$route('link.delete', {
			id: link.id.toString(),
		});
		submit(method.at(0) as any, path);
	};

	return (
		<FormLink
			title={t('link.delete')}
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
