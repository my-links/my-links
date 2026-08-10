import { useMemo } from 'react';
import { Button } from '@minimalstuff/ui';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { Head, router } from '@inertiajs/react';

import { useAuth } from '~/hooks/use_auth';
import { InertiaProps } from '~/types/inertia';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { FilterList } from '~/components/common/filter_list';
import { SharedLinkList } from '~/components/shared/link_list';

type SharedPageProps = InertiaProps<{
	activeCollection: Data.Collection.Variants['withLinks'];
	isFollowing?: boolean;
}>;

export default function SharedPage({
	activeCollection,
	isFollowing,
}: Readonly<SharedPageProps>) {
	const auth = useAuth();
	const isMobile = useIsMobile();

	const handleFollow = async () => {
		if (!auth.isAuthenticated) {
			return;
		}
		router.post(
			`/collections/${activeCollection.id}/follow`,
			{},
			{
				onSuccess: () => {
					router.reload();
				},
			}
		);
	};

	const handleUnfollow = async () => {
		if (!auth.isAuthenticated) {
			return;
		}
		router.post(
			`/collections/${activeCollection.id}/unfollow`,
			{},
			{
				onSuccess: () => {
					router.reload();
				},
			}
		);
	};

	const pageTitle = useMemo(() => {
		const icon = activeCollection.icon ? `${activeCollection.icon} ` : '';
		return `${icon}${activeCollection.name}`;
	}, [activeCollection]);

	return (
		<>
			<Head title={pageTitle} />
			<div className="space-y-4">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
							{activeCollection.icon && (
								<span className="text-3xl">{activeCollection.icon}</span>
							)}
							{activeCollection.name}
						</h1>
						{activeCollection.description && (
							<p className="text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
								{activeCollection.description}
							</p>
						)}
					</div>
					{auth.isAuthenticated && !activeCollection.isOwner && (
						<div className="ml-4">
							{isFollowing ? (
								<Button color="danger" onClick={() => void handleUnfollow()}>
									<Trans>Unfollow</Trans>
								</Button>
							) : (
								<Button color="primary" onClick={() => void handleFollow()}>
									<Trans>Follow</Trans>
								</Button>
							)}
						</div>
					)}
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							<Trans>
								Collection managed by <b>{activeCollection.author?.fullname}</b>
							</Trans>
						</p>
						{!!activeCollection.followersCount && (
							<>
								<span className="text-gray-400 dark:text-gray-600">•</span>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{activeCollection.followersCount}{' '}
									{activeCollection.followersCount === 1 ? (
										<Trans>follower</Trans>
									) : (
										<Trans>followers</Trans>
									)}
								</p>
							</>
						)}
					</div>

					{!isMobile && <FilterList layoutStoreKey="shared" />}
				</div>

				<SharedLinkList links={activeCollection.links ?? []} />
			</div>
		</>
	);
}
