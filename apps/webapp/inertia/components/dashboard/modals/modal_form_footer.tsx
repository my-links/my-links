import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, type ButtonColor } from '@minimalstuff/ui';

interface ModalFormFooterProps {
	formId: string;
	onCancel: () => void;
	canSubmit: boolean;
	processing: boolean;
	submitLabel: ReactNode;
	submitColor?: ButtonColor;
}

export const ModalFormFooter = ({
	formId,
	onCancel,
	canSubmit,
	processing,
	submitLabel,
	submitColor,
}: Readonly<ModalFormFooterProps>) => (
	<>
		<Button variant="outline" color="neutral" type="button" onClick={onCancel}>
			<Trans>Cancel</Trans>
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
