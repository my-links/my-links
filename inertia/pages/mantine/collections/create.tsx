import { Visibility } from '#enums/visibility';
import { useForm } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MantineFormCollection, {
	FormCollectionData,
} from '~/mantine/components/form/mantine_form_collection';

export default function CreateCollectionPage({
	disableHomeLink,
}: {
	disableHomeLink: boolean;
}) {
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

	const handleSubmit = () => {
		const { method, url } = route('collection.create');
		submit(method, url);
	};

	return (
		<MantineFormCollection
			title={t('collection.create')}
			canSubmit={!isFormDisabled}
			disableHomeLink={disableHomeLink}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
		/>
	);
}
