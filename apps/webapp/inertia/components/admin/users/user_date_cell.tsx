import { ClientOnly } from '@minimalstuff/ui';

import { NaContent } from '~/components/common/na_content';
import { formatDate } from '~/lib/format';

type UserDateCellProps = {
	date?: string | null;
};

export const UserDateCell = ({ date }: Readonly<UserDateCellProps>) => (
	<ClientOnly>{date ? formatDate(date) : <NaContent />}</ClientOnly>
);
