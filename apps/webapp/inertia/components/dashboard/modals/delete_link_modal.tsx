import type { Data } from '@generated/data';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { FormLinkContent } from '~/components/dashboard/forms/form_link_content';
import { urlFor } from '~/lib/tuyau';
import { FormLinkData } from '~/types/link_form';

interface DeleteLinkModalProps {
	link: Data.Link.Variants['withCollection'];
	onClose: () => void;
}

export function DeleteLinkModal({
	link,
	onClose,
}: Readonly<DeleteLinkModalProps>) {
	const { data, setData, submit, processing, errors } = useForm<FormLinkData>({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionId: link.collectionId,
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const deleteUrl = urlFor('link.delete', {
			id: link.id.toString(),
		});
		submit('delete', deleteUrl, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<p className="text-sm text-red-600 dark:text-red-400">
				<Trans>Are you sure you want to delete this link?</Trans>
			</p>

			<FormLinkContent
				data={data}
				setData={setData}
				errors={errors}
				collections={[link.collection!]}
				disableInputs
			/>

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="secondary" type="button" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button variant="danger" type="submit" disabled={processing}>
					{processing && (
						<span
							className="i-svg-spinners-3-dots-fade w-4 h-4"
							aria-hidden="true"
						/>
					)}
					<Trans>Delete</Trans>
				</Button>
			</div>
		</form>
	);
}
