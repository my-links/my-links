import { Trans } from '@lingui/react/macro';
import { ErrorPage } from '~/components/errors/error_page';

interface ServerErrorProps {
	error: {
		message: string;
	};
}

const ServerError = ({ error }: Readonly<ServerErrorProps>) => (
	<ErrorPage
		title={<Trans>Server Error</Trans>}
		message={error.message || <Trans>An unexpected error occurred.</Trans>}
		statusCode={500}
	/>
);

export default ServerError;
