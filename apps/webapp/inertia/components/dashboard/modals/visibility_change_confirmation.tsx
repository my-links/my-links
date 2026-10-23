import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { MakeCollectionPrivateConfirmation } from '~/components/dashboard/modals/make_collection_private_confirmation';
import { MakeCollectionPublicConfirmation } from '~/components/dashboard/modals/make_collection_public_confirmation';
import { buildCollectionShareUrl } from '~/lib/collection_share_url';
import {
	VISIBILITY_CHANGE_CONFIRMATION,
	type VisibilityChangeConfirmation as RequiredConfirmation,
} from '~/lib/collection_visibility_change';

type VisibilityChangeConfirmationProps = {
	confirmation: RequiredConfirmation;
	collection: Pick<Data.Collection, 'id' | 'followersCount'>;
	linksCount: number | undefined;
};

export const VisibilityChangeConfirmation = ({
	confirmation,
	collection,
	linksCount,
}: Readonly<VisibilityChangeConfirmationProps>) => {
	if (confirmation === VISIBILITY_CHANGE_CONFIRMATION.EXPOSURE) {
		return (
			<MakeCollectionPublicConfirmation
				linksCount={linksCount}
				shareUrl={buildCollectionShareUrl(collection.id)}
			/>
		);
	}
	if (confirmation === VISIBILITY_CHANGE_CONFIRMATION.FOLLOWERS_LOSS) {
		return (
			<MakeCollectionPrivateConfirmation
				followersCount={collection.followersCount ?? 0}
			/>
		);
	}
	return null;
};

export const visibilityChangeSubmitLabel = (
	confirmation: RequiredConfirmation
) =>
	confirmation === VISIBILITY_CHANGE_CONFIRMATION.FOLLOWERS_LOSS ? (
		<Trans>Make private</Trans>
	) : (
		<Trans>Make public</Trans>
	);
