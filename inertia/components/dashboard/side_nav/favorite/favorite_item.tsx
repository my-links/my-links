import styled from '@emotion/styled';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaRegEye } from 'react-icons/fa';
import { GoPencil } from 'react-icons/go';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import { DropdownItemLink } from '~/components/common/dropdown/dropdown_item';
import Legend from '~/components/common/legend';
import TextEllipsis from '~/components/common/text_ellipsis';
import LinkFavicon from '~/components/dashboard/link/link_favicon';
import FavoriteDropdownItem from '~/components/dashboard/side_nav/favorite/favorite_dropdown_item';
import { ItemExternalLink } from '~/components/dashboard/side_nav/nav_item';
import { appendCollectionId, appendLinkId } from '~/lib/navigation';
import { LinkWithCollection } from '~/types/app';

const FavoriteItemStyle = styled(ItemExternalLink)(({ theme }) => ({
	height: 'auto',
	backgroundColor: theme.colors.secondary,
}));

const FavoriteDropdown = styled(Dropdown)(({ theme }) => ({
	backgroundColor: theme.colors.secondary,
}));

const FavoriteContainer = styled.div({
	flex: 1,
	lineHeight: '1.1rem',
});

export default function FavoriteItem({ link }: { link: LinkWithCollection }) {
	const { t } = useTranslation();
	return (
		<FavoriteItemStyle href={link.url}>
			<LinkFavicon url={link.url} size={24} />
			<FavoriteContainer>
				<TextEllipsis>{link.name}</TextEllipsis>
				<Legend>{link.collection.name}</Legend>
			</FavoriteContainer>
			<FavoriteDropdown
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
				label={<BsThreeDotsVertical />}
				svgSize={18}
			>
				<DropdownItemLink
					href={appendCollectionId(route('dashboard').url, link.collection.id)}
				>
					<FaRegEye /> {t('go-to-collection')}
				</DropdownItemLink>
				<FavoriteDropdownItem link={link} />
				<DropdownItemLink
					href={appendLinkId(route('link.edit-form').url, link.id)}
				>
					<GoPencil /> {t('link.edit')}
				</DropdownItemLink>
				<DropdownItemLink
					href={appendLinkId(route('link.delete-form').url, link.id)}
					danger
				>
					<IoTrashOutline /> {t('link.delete')}
				</DropdownItemLink>
			</FavoriteDropdown>
		</FavoriteItemStyle>
	);
}
