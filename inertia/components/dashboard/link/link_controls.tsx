import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { route } from '@izzyjs/route/client';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoPencil } from 'react-icons/go';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import {
  DropdownItemButton,
  DropdownItemLink,
} from '~/components/common/dropdown/dropdown_item';
import useActiveCollection from '~/hooks/use_active_collection';
import useCollections from '~/hooks/use_collections';
import { appendLinkId } from '~/lib/navigation';
import { makeRequest } from '~/lib/request';
import { Link } from '~/types/app';

const StartItem = styled(DropdownItemButton)(({ theme }) => ({
  color: theme.colors.yellow,
}));

export default function LinkControls({ link }: { link: Link }) {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { collections, setCollections } = useCollections();
  const { setActiveCollection } = useActiveCollection();

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

  const onFavorite = () => {
    const { url, method } = route('link.toggle-favorite', {
      params: { id: link.id.toString() },
    });
    makeRequest({
      url,
      method,
      body: {
        favorite: !link.favorite,
      },
    })
      .then(() => toggleFavorite(link.id))
      .catch(console.error);
  };

  return (
    <Dropdown
      label={<BsThreeDotsVertical css={{ color: theme.colors.grey }} />}
      css={{ backgroundColor: theme.colors.secondary }}
      svgSize={18}
    >
      <StartItem onClick={onFavorite}>
        {!link.favorite ? (
          <>
            <AiFillStar /> {t('add-favorite')}
          </>
        ) : (
          <>
            <AiOutlineStar /> {t('remove-favorite')}
          </>
        )}
      </StartItem>
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
    </Dropdown>
  );
}
