import type Link from '#models/link';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { route } from '@izzyjs/route/client';
import { useCallback } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoPencil } from 'react-icons/go';
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
    const editRoute = route('link.edit', {
      params: { id: link.id },
    });
    makeRequest({
      url: editRoute.url,
      method: editRoute.method,
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

  return (
    <Dropdown
      label={<BsThreeDotsVertical css={{ color: theme.colors.grey }} />}
      css={{ backgroundColor: theme.colors.secondary }}
      svgSize={18}
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
        href={appendCollectionId(
          route('link.edit-form').url,
          link.collectionId
        )}
      >
        <GoPencil /> Edit
      </DropdownItemLink>
      <DropdownItemLink
        href={appendCollectionId(
          route('link.delete-form').url,
          link.collectionId
        )}
        danger
      >
        <IoTrashOutline /> Delete
      </DropdownItemLink>
    </Dropdown>
  );
}
