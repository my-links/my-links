import { Collection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import clsx from 'clsx';
import { useMemo } from 'react';
import { FormLinkContent } from '~/components/dashboard/forms/form_link_content';
import { isValidHttpUrl } from '~/lib/navigation';
import { useRouteHelper } from '~/lib/route_helper';
import { FormLinkData } from '~/types/link_form';

interface CreateLinkModalProps {
	collections: Collection[];
	defaultCollectionId?: Collection['id'];
	onClose: () => void;
}

export function CreateLinkModal({
	collections,
	defaultCollectionId,
	onClose,
}: CreateLinkModalProps) {
	const collectionId = defaultCollectionId ?? collections[0]?.id;
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

	const { route } = useRouteHelper();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const { method, url } = route('link.create');
		submit(method as any, url, {
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
				collections={collections}
			/>

			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
				<button
					type="button"
					onClick={onClose}
					className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
				>
					<Trans>Cancel</Trans>
				</button>
				<button
					type="submit"
					disabled={!canSubmit}
					className={clsx(
						'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
						!canSubmit
							? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700'
					)}
				>
					{processing ? (
						<span className="flex items-center gap-2">
							<span className="i-svg-spinners-3-dots-fade w-4 h-4" />
							<Trans>Create</Trans>
						</span>
					) : (
						<Trans>Create</Trans>
					)}
				</button>
			</div>
		</form>
	);
}
