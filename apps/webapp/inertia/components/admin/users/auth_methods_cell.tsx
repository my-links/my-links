import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { NaContent } from '~/components/common/na_content';

type AuthMethod = Data.User.Variants['withCounters']['authMethods'][number];

interface AuthMethodsCellProps {
	authMethods: readonly AuthMethod[];
}

const PILL_CLASS =
	'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300';

const AuthMethodPill = ({ method }: Readonly<{ method: AuthMethod }>) =>
	method === 'password' ? (
		<span className={PILL_CLASS}>
			<i className="i-mdi-form-textbox-password w-3.5 h-3.5" />
			<Trans>Password</Trans>
		</span>
	) : (
		<span className={PILL_CLASS}>
			<i className="i-mdi-google w-3.5 h-3.5" />
			Google
		</span>
	);

/**
 * Every way the account can get in. An account with none is not a bug — it is
 * one that outlived its only provider, and saying so is the point.
 */
export const AuthMethodsCell = ({
	authMethods,
}: Readonly<AuthMethodsCellProps>) => {
	if (authMethods.length === 0) return <NaContent />;

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{authMethods.map((method) => (
				<AuthMethodPill key={method} method={method} />
			))}
		</div>
	);
};
