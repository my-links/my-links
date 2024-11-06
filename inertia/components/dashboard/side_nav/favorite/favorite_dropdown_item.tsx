import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { DropdownItemButton } from '~/components/common/dropdown/dropdown_item';
import { onFavorite } from '~/lib/favorite';
import { useFavorites } from '~/store/collection_store';
import { Link } from '~/types/app';

const StarItem = styled(DropdownItemButton)(({ theme }) => ({
	color: theme.colors.yellow,
}));

export default function FavoriteDropdownItem({ link }: { link: Link }) {
	const { toggleFavorite } = useFavorites();
	const { t } = useTranslation();

	const onFavoriteCallback = () => toggleFavorite(link.id);
	return (
		<StarItem
			onClick={() => onFavorite(link.id, !link.favorite, onFavoriteCallback)}
		>
			{!link.favorite ? (
				<>
					<AiFillStar /> {t('add-favorite')}
				</>
			) : (
				<>
					<AiOutlineStar /> {t('remove-favorite')}
				</>
			)}
		</StarItem>
	);
}
