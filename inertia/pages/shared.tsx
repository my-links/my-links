import { SharedCollection } from '#shared/types/dto';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { FilterList } from '~/components/common/filter_list';
import { SharedLinkList } from '~/components/shared/link_list';
import { useAuth } from '~/hooks/use_auth';
import { useIsMobile } from '~/hooks/use_is_mobile';

interface SharedPageProps {
	activeCollection: SharedCollection;
	isFollowing?: boolean;
}

export default function SharedPage({
	activeCollection,
	isFollowing,
}: SharedPageProps) {
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

	return (
		<div className="space-y-4">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
						{activeCollection.name}
					</h1>
					{activeCollection.description && (
						<p className="text-gray-600 dark:text-gray-400 whitespace-pre-line break-words">
							{activeCollection.description}
						</p>
					)}
				</div>
				{auth.isAuthenticated && (
					<div className="ml-4">
						{isFollowing ? (
							<button
								onClick={handleUnfollow}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
							>
								<Trans>Unfollow</Trans>
							</button>
						) : (
							<button
								onClick={handleFollow}
								className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
							>
								<Trans>Follow</Trans>
							</button>
						)}
					</div>
				)}
			</div>

			<div className="flex items-center justify-between">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					<Trans>
						Collection managed by <b>{activeCollection.author.fullname}</b>
					</Trans>
				</p>

				{!isMobile && <FilterList layoutStoreKey="shared" />}
			</div>

			<SharedLinkList links={activeCollection.links} />
		</div>
	);
}
