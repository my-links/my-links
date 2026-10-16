import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, type ButtonColor } from '@minimalstuff/ui';

type ModalFormFooterProps = {
	formId: string;
	onCancel: () => void;
	canSubmit: boolean;
	processing: boolean;
	submitLabel: ReactNode;
	submitColor?: ButtonColor;
	cancelLabel?: ReactNode;
};

export const ModalFormFooter = ({
	formId,
	onCancel,
	canSubmit,
	processing,
	submitLabel,
	submitColor,
	cancelLabel = <Trans>Cancel</Trans>,
}: Readonly<ModalFormFooterProps>) => (
	<>
		<Button variant="outline" color="neutral" type="button" onClick={onCancel}>
			{cancelLabel}
		</Button>
		<Button
			type="submit"
			form={formId}
			color={submitColor}
			loading={processing}
			disabled={!canSubmit}
		>
			{submitLabel}
		</Button>
	</>
);
