import type { Data } from '@generated/data';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { useMemo } from 'react';
import { FormLinkContent } from '~/components/dashboard/forms/form_link_content';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { isValidHttpUrl } from '~/lib/navigation';
import { urlFor } from '~/lib/tuyau';
import { FormLinkData } from '~/types/link_form';

interface EditLinkModalProps {
	link: Data.Link.Variants['withCollection'];
	onClose: () => void;
}

export function EditLinkModal({ link, onClose }: Readonly<EditLinkModalProps>) {
	const { activeCollection, allCollections } = useDashboardProps();
	const { data, setData, submit, processing, errors } = useForm<FormLinkData>({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionId:
			link.collectionId ?? activeCollection?.id ?? allCollections[0]?.id,
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
	}, [data, link, processing]);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const editUrl = urlFor('link.edit', {
			id: link.id.toString(),
		});
		submit('put', editUrl, {
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
				<Button type="submit" disabled={!canSubmit}>
					{processing && (
						<span
							className="i-svg-spinners-3-dots-fade w-4 h-4"
							aria-hidden="true"
						/>
					)}
					<Trans>Update</Trans>
				</Button>
			</div>
		</form>
	);
}
