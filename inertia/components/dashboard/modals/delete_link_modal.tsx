import { LinkWithCollection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '~/components/common/button';
import { FormLinkContent } from '~/components/dashboard/forms/form_link_content';
import { useRouteHelper } from '~/lib/route_helper';
import { FormLinkData } from '~/types/link_form';

interface DeleteLinkModalProps {
	link: LinkWithCollection;
	onClose: () => void;
}

export function DeleteLinkModal({ link, onClose }: DeleteLinkModalProps) {
	const { data, setData, submit, processing, errors } = useForm<FormLinkData>({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionId: link.collectionId,
	});

	const { url: getUrl } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const deleteUrl = getUrl('link.delete', {
			params: { id: link.id.toString() },
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
				collections={[link.collection]}
				disableInputs
			/>

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<Button variant="secondary" type="button" onClick={onClose}>
					<Trans>Cancel</Trans>
				</Button>
				<Button
					variant="danger"
					type="submit"
					loading={processing}
					disabled={processing}
				>
					<Trans>Delete</Trans>
				</Button>
			</div>
		</form>
	);
}
