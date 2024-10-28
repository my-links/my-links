import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoPencil } from 'react-icons/go';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import { DropdownItemLink } from '~/components/common/dropdown/dropdown_item';
import FavoriteDropdownItem from '~/components/dashboard/side_nav/favorite/favorite_dropdown_item';
import { routeWithLinkId } from '~/lib/navigation';
import { Link } from '~/types/app';

export default function LinkControls({ link }: { link: Link }) {
	const theme = useTheme();
	const { t } = useTranslation('common');

	return (
		<Dropdown
			label={<BsThreeDotsVertical css={{ color: theme.colors.grey }} />}
			css={{ backgroundColor: theme.colors.secondary }}
			svgSize={18}
		>
			<FavoriteDropdownItem link={link} />
			<DropdownItemLink href={routeWithLinkId('link.edit-form', link.id)}>
				<GoPencil /> {t('link.edit')}
			</DropdownItemLink>
			<DropdownItemLink
				href={routeWithLinkId('link.delete-form', link.id)}
				danger
			>
				<IoTrashOutline /> {t('link.delete')}
			</DropdownItemLink>
		</Dropdown>
	);
}
