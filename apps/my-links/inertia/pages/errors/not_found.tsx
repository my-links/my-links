import { Trans } from '@lingui/react/macro';
import { ErrorPage } from '~/components/errors/error_page';

const NotFound = () => (
	<ErrorPage
		title={<Trans>Page not found</Trans>}
		message={<Trans>This page does not exist.</Trans>}
		statusCode={404}
	/>
);

export default NotFound;
