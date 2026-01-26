import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { useMemo } from 'react';
import { Button } from '~/components/common/button';
import { FormLinkContent } from '~/components/dashboard/forms/form_link_content';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { isValidHttpUrl } from '~/lib/navigation';
import { useRouteHelper } from '~/lib/route_helper';
import { FormLinkData } from '~/types/link_form';

interface CreateLinkModalProps {
	onClose: () => void;
}

export function CreateLinkModal({ onClose }: CreateLinkModalProps) {
	const { activeCollection, allCollections } = useDashboardProps();
	const collectionId = activeCollection?.id ?? allCollections[0]?.id;
	const { data, setData, submit, processing, errors } = useForm<FormLinkData>({
		name: '',
		description: '',
		url: '',
		favorite: false,
		collectionId: collectionId!,
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

	const { url: getUrl } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const createUrl = getUrl('link.create');
		submit('post', createUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<FormLinkContent
				data={data}
				setData={setData}
				errors={errors}
				collections={allCollections}
			/>

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="secondary" type="button" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button type="submit" loading={processing} disabled={!canSubmit}>
					<Trans>Create</Trans>
				</Button>
			</div>
		</form>
	);
}
