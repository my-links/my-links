import { ClientOnly } from '@minimalstuff/ui';

import { formatDate } from '~/lib/format';
import { NaContent } from '~/components/common/na_content';

type UserDateCellProps = {
	date?: string | null;
};

export const UserDateCell = ({ date }: Readonly<UserDateCellProps>) => (
	<ClientOnly>{date ? formatDate(date) : <NaContent />}</ClientOnly>
);
