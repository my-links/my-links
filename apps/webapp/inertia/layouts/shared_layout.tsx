import type { ReactNode } from 'react';
import { Link } from '@adonisjs/inertia/react';

import { useAuth } from '~/hooks/use_auth';
import { BaseLayout } from '~/layouts/base_layout';
import { AccountMenu } from '~/components/common/navigation/account_menu';
import { GuestAuthActions } from '~/components/common/navigation/guest_auth_actions';

interface SharedLayoutProps {
	children: ReactNode;
}

/**
 * Shell for a publicly shared collection: logo, sign-in bar for a visitor or
 * the account menu for a signed-in one. No footer, no dashboard chrome.
 */
export function SharedLayout({ children }: Readonly<SharedLayoutProps>) {
	const auth = useAuth();

	return (
		<BaseLayout>
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
				<div className="max-w-[1920px] mx-auto p-4 md:p-6">
					<div className="h-14 flex items-center justify-between gap-4 mb-6">
						<Link route="home" className="flex-shrink-0">
							<img
								src="/logo.png"
								alt="MyLinks's logo"
								referrerPolicy="no-referrer"
								className="h-8"
							/>
						</Link>
						{auth.isAuthenticated ? (
							<AccountMenu side="bottom" />
						) : (
							<GuestAuthActions />
						)}
					</div>
					<div data-page-transition>{children}</div>
				</div>
			</div>
		</BaseLayout>
	);
}
