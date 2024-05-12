import PATHS from '#constants/paths';
import type Link from '#models/link';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HiOutlinePencil } from 'react-icons/hi2';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import {
  DropdownItemButton,
  DropdownItemLink,
} from '~/components/common/dropdown/dropdown_item';
import useCollections from '~/hooks/use_collections';
import { appendCollectionId } from '~/lib/navigation';
import { makeRequest } from '~/lib/request';

const StartItem = styled(DropdownItemButton)(({ theme }) => ({
  color: theme.colors.yellow,
}));

const DeleteItem = styled(DropdownItemLink)(({ theme }) => ({
  color: theme.colors.lightRed,
}));

export default function LinkControls({ link }: { link: Link }) {
  const theme = useTheme();
  const { collections, setCollections } = useCollections();

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
    },
    [collections, setCollections]
  );

  const onFavorite = () => {
    makeRequest({
      url: `${PATHS.API.LINK}/${link.id}`,
      method: 'PUT',
      body: {
        name: link.name,
        url: link.url,
        favorite: !link.favorite,
        collectionId: link.collectionId,
      },
    })
      .then(() => toggleFavorite(link.id))
      .catch(console.error);
  };

  console.log(link.favorite, link.favorite ? 'oui' : 'non');
  return (
    <Dropdown
      label={<BsThreeDotsVertical css={{ color: theme.colors.grey }} />}
      css={{ backgroundColor: theme.colors.secondary }}
    >
      <StartItem onClick={onFavorite}>
        {!link.favorite ? (
          <>
            <AiFillStar /> Add to favorites
          </>
        ) : (
          <>
            <AiOutlineStar /> Remove from favorites
          </>
        )}
      </StartItem>
      <DropdownItemLink
        href={appendCollectionId(PATHS.LINK.EDIT, link.collectionId)}
      >
        <HiOutlinePencil /> Edit
      </DropdownItemLink>
      <DeleteItem
        href={appendCollectionId(PATHS.LINK.REMOVE, link.collectionId)}
      >
        <IoTrashOutline /> Delete
      </DeleteItem>
    </Dropdown>
  );
}
