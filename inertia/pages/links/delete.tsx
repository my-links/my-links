import { LinkWithCollection } from '#shared/types/dto';
import { useForm } from '@inertiajs/react';
import { Trans as TransComponent } from '@lingui/react';
import { FormLink } from '~/components/form/form_link';
import { useRouteHelper } from '~/lib/route_helper';

interface DeleteLinkPageProps {
	link: LinkWithCollection;
}

export default function DeleteLinkPage({ link }: DeleteLinkPageProps) {
	const { data, setData, submit, processing } = useForm({
		name: link.name,
		description: link.description,
		url: link.url,
		favorite: link.favorite,
		collectionId: link.collectionId,
	});

	const { route } = useRouteHelper();

	const handleSubmit = () => {
		const { method, url } = route('link.delete', {
			params: { id: link.id.toString() },
		});
		submit(method, url);
	};

	return (
		<FormLink
			title={<TransComponent id="common:link.delete" message="Delete a link" />}
			textSubmitButton={
				<TransComponent id="common:form.delete" message="Delete" />
			}
			canSubmit={!processing}
			data={data}
			setData={setData}
			handleSubmit={handleSubmit}
			collections={[link.collection]}
			disableInputs
			submitBtnDanger
		/>
	);
}
