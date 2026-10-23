import type { Data } from '@generated/data';
import { ModalFooter } from '@minimalstuff/ui';
import { useId } from 'react';

import { ModalFormFooter } from '~/components/dashboard/modals/modal_form_footer';
import {
	VisibilityChangeConfirmation,
	visibilityChangeSubmitLabel,
} from '~/components/dashboard/modals/visibility_change_confirmation';
import type { VisibilityChangeConfirmation as RequiredConfirmation } from '~/lib/collection_visibility_change';

type ConfirmVisibilityChangeModalProps = {
	confirmation: RequiredConfirmation;
	collection: Pick<Data.Collection, 'id' | 'followersCount'>;
	linksCount: number | undefined;
	onConfirm: () => void;
	onClose: () => void;
};

export function ConfirmVisibilityChangeModal({
	confirmation,
	collection,
	linksCount,
	onConfirm,
	onClose,
}: Readonly<ConfirmVisibilityChangeModalProps>) {
	const formId = useId();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onConfirm();
	};

	return (
		<>
			<form id={formId} onSubmit={handleSubmit}>
				<VisibilityChangeConfirmation
					confirmation={confirmation}
					collection={collection}
					linksCount={linksCount}
				/>
			</form>
			<ModalFooter>
				<ModalFormFooter
					formId={formId}
					onCancel={onClose}
					canSubmit
					processing={false}
					submitLabel={visibilityChangeSubmitLabel(confirmation)}
				/>
			</ModalFooter>
		</>
	);
}
