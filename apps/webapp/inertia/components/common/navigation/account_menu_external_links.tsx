import { Trans } from '@lingui/react/macro';
import { MenuItem } from '@minimalstuff/ui';

import {
	PROJECT_DOCS_URL,
	PROJECT_EXTENSION_CHROME_URL,
	PROJECT_EXTENSION_FIREFOX_URL,
	PROJECT_REPO_GITHUB_URL,
} from '~/consts/project';

const EXTERNAL_HINT = '↗';

export const AccountMenuExternalLinks = () => (
	<>
		<MenuItem
			icon="i-mdi-book-open-variant"
			href={PROJECT_DOCS_URL}
			target="_blank"
			trailing={EXTERNAL_HINT}
		>
			<Trans>Documentation</Trans>
		</MenuItem>
		<MenuItem
			icon="i-mdi-google-chrome"
			href={PROJECT_EXTENSION_CHROME_URL}
			target="_blank"
			trailing={EXTERNAL_HINT}
		>
			<Trans>Chrome extension</Trans>
		</MenuItem>
		<MenuItem
			icon="i-mdi-firefox"
			href={PROJECT_EXTENSION_FIREFOX_URL}
			target="_blank"
			trailing={EXTERNAL_HINT}
		>
			<Trans>Firefox extension</Trans>
		</MenuItem>
		<MenuItem
			icon="i-mdi-github"
			href={PROJECT_REPO_GITHUB_URL}
			target="_blank"
			trailing={EXTERNAL_HINT}
		>
			<Trans>Source code</Trans>
		</MenuItem>
	</>
);
