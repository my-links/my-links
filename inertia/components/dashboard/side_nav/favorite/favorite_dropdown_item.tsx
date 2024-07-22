import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { DropdownItemButton } from '~/components/common/dropdown/dropdown_item';
import useActiveCollection from '~/hooks/use_active_collection';
import useCollections from '~/hooks/use_collections';
import { onFavorite } from '~/lib/favorite';
import { Link } from '~/types/app';

const StarItem = styled(DropdownItemButton)(({ theme }) => ({
  color: theme.colors.yellow,
}));

export default function FavoriteDropdownItem({ link }: { link: Link }) {
  const { collections, setCollections } = useCollections();
  const { setActiveCollection } = useActiveCollection();
  const { t } = useTranslation();

  const toggleFavorite = useCallback(
    (linkId: Link['id']) => {
      let linkIndex = 0;
      const collectionIndex = collections.findIndex(({ links }) => {
        const lIndex = links.findIndex((l) => l.id === linkId);
        if (lIndex !== -1) {
          linkIndex = lIndex;
        }
        return lIndex !== -1;
      });

      const collectionLink = collections[collectionIndex].links[linkIndex];
      const collectionsCopy = [...collections];
      collectionsCopy[collectionIndex].links[linkIndex] = {
        ...collectionLink,
        favorite: !collectionLink.favorite,
      };

      setCollections(collectionsCopy);
      setActiveCollection(collectionsCopy[collectionIndex]);
    },
    [collections, setCollections]
  );

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
