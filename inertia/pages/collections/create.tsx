import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	FormCollection,
	FormCollectionData,
} from '~/components/form/form_collection';
import { Visibility } from '~/types/app';
import { useRouteHelper } from '~/lib/route_helper';

interface CreateCollectionPageProps {
	disableHomeLink: boolean;
}

export default function CreateCollectionPage({
	disableHomeLink,
}: CreateCollectionPageProps) {
	const { t } = useTranslation('common');
	const { data, setData, submit, processing } = useForm<FormCollectionData>({
		name: '',
		description: '',
		visibility: Visibility.PRIVATE,
	});
	const isFormDisabled = useMemo(
		() => processing || data.name.length === 0,
		[processing, data]
	);

	const { route } = useRouteHelper();

	const handleSubmit = () => {
		const { method, url } = route('collection.create');
		submit(method, url);
	};

	return (
		<FormCollection
			title={t('collection.create')}
			textSubmitButton={t('form.create')}
			canSubmit={!isFormDisabled}
			disableHomeLink={disableHomeLink}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
		/>
	);
}
