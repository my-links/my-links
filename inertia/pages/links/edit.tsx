import { Collection, LinkWithCollection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { Trans as TransComponent } from '@lingui/react';
import { FormLink } from '~/components/form/form_link';
import { isValidHttpUrl } from '~/lib/navigation';
import { useRouteHelper } from '~/lib/route_helper';

interface EditLinkPageProps {
	collections: Collection[];
	link: LinkWithCollection;
}

export default function EditLinkPage({ collections, link }: EditLinkPageProps) {
	const { data, setData, submit, processing } = useForm({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionId: link.collectionId,
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
	}, [data, processing]);

	const { route } = useRouteHelper();

	const handleSubmit = () => {
		const { method, url } = route('link.edit', {
			params: { id: link.id.toString() },
		});
		submit(method, url);
	};

	return (
		<FormLink
			title={<TransComponent id="common:link.edit" message="Edit a link" />}
			textSubmitButton={
				<TransComponent id="common:form.update" message="Update" />
			}
			canSubmit={canSubmit}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			collections={collections}
		/>
	);
}
