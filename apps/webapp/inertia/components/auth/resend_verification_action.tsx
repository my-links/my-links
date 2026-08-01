import { Button } from '@minimalstuff/ui';
import { useForm } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';

import { urlFor } from '~/lib/tuyau';

type ResendVerificationActionProps = {
	readonly email: string;
};

/**
 * Offered only to a visitor the server just turned away for an unconfirmed
 * address, and pre-filled with the address they signed in with — the flow
 * exists so nobody has to go hunting for a link that may have expired.
 */
export const ResendVerificationAction = ({
	email,
}: Readonly<ResendVerificationActionProps>) => {
	const { submit, processing } = useForm({ email });

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submit('post', urlFor('auth.verification.resend'));
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-6 rounded-lg border border-rule dark:border-rule-dark bg-paper dark:bg-ink p-4 text-center"
		>
			<p className="text-sm text-ink/70 dark:text-ink-dark/70 mb-3">
				<Trans>
					Your address still needs confirming. We can send the link again.
				</Trans>
			</p>
			<Button type="submit" loading={processing} fullWidth>
				<Trans>Send a new confirmation link</Trans>
			</Button>
		</form>
	);
};
