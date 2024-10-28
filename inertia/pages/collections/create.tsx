import { Visibility } from '#enums/visibility';
import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormCollection, {
	FormCollectionData,
} from '~/components/form/form_collection';
import { getRoute } from '~/lib/navigation';

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
		const { method, path } = getRoute('collection.create');
		submit(method.at(0) as any, path);
	};

	return (
		<FormCollection
			title={t('collection.create')}
			canSubmit={!isFormDisabled}
			disableHomeLink={disableHomeLink}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
		/>
	);
}
