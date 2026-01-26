import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { useMemo } from 'react';
import { Button } from '~/components/common/button';
import { FormCollectionContent } from '~/components/dashboard/forms/form_collection_content';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useRouteHelper } from '~/lib/route_helper';
import { Visibility } from '~/types/app';
import { FormCollectionData } from '~/types/collection_form';

interface EditCollectionModalProps {
	onClose: () => void;
}

export function EditCollectionModal({ onClose }: EditCollectionModalProps) {
	const { activeCollection } = useDashboardProps();
	const { data, setData, put, processing, errors } =
		useForm<FormCollectionData>({
			name: activeCollection?.name ?? '',
			description: activeCollection?.description ?? '',
			visibility: activeCollection?.visibility ?? Visibility.PRIVATE,
			icon: activeCollection?.icon ?? null,
		});

	const canSubmit = useMemo<boolean>(() => {
		const trimmedName = data.name.trim();
		const trimmedDescription = data.description?.trim();
		const isFormEdited =
			trimmedName !== activeCollection?.name ||
			trimmedDescription !== activeCollection?.description ||
			data.visibility !== activeCollection?.visibility ||
			data.icon !== (activeCollection?.icon ?? null);
		const isFormValid = trimmedName !== '';
		return isFormEdited && isFormValid && !processing;
	}, [data, activeCollection, processing]);

	const { url } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const editUrl = url('collection.edit', {
			params: { id: activeCollection?.id.toString() ?? '' },
		});
		put(editUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<FormCollectionContent data={data} setData={setData} errors={errors} />

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="secondary" type="button" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button type="submit" loading={processing} disabled={!canSubmit}>
					<Trans>Update</Trans>
				</Button>
			</div>
		</form>
	);
}
