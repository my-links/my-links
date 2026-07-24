import { useMemo } from 'react';
import { Button } from '@minimalstuff/ui';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';

import { urlFor } from '~/lib/tuyau';
import { FormLinkData } from '~/types/link_form';
import { isValidHttpUrl } from '~/lib/navigation';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { FormLinkContent } from '~/components/dashboard/forms/form_link_content';

interface CreateLinkModalProps {
	onClose: () => void;
}

export function CreateLinkModal({ onClose }: Readonly<CreateLinkModalProps>) {
	const { activeCollection, allCollections } = useDashboardProps();
	const defaultCollectionId = activeCollection?.id ?? allCollections[0]?.id;
	const { data, setData, submit, processing, errors } = useForm<FormLinkData>({
		name: '',
		description: '',
		url: '',
		favorite: false,
		collectionIds: defaultCollectionId ? [defaultCollectionId] : [],
	});

	const canSubmit = useMemo<boolean>(
		() =>
			data.name !== '' &&
			isValidHttpUrl(data.url) &&
			data.favorite !== null &&
			data.collectionIds.length > 0 &&
			!processing,
		[data, processing]
	);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const createUrl = urlFor('link.create');
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
				<Button
					variant="outline"
					color="neutral"
					type="button"
					onClick={onClose}
				>
					<Trans>Cancel</Trans>
				</Button>
				<Button type="submit" disabled={!canSubmit}>
					{processing && (
						<span
							className="i-svg-spinners-3-dots-fade w-4 h-4"
							aria-hidden="true"
						/>
					)}
					<Trans>Create</Trans>
				</Button>
			</div>
		</form>
	);
}
