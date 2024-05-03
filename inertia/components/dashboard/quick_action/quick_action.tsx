import type Collection from '#models/collection';
import type Link from '#models/link';
import { Link as LinkTag } from '@inertiajs/react';
import { MouseEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineEdit } from 'react-icons/ai';
import { CgTrashEmpty } from 'react-icons/cg';
import { IoAddOutline } from 'react-icons/io5';
import ActionStyle from '~/components/dashboard/quick_action/_quick_action_style';
import { appendCollectionId, appendResourceId } from '~/lib/navigation';

type Resource = 'collection' | 'link';
type Action = 'create' | 'edit' | 'remove';

const getIconFromAction = (action: Action) => {
  switch (action) {
    case 'create':
      return IoAddOutline;
    case 'edit':
      return AiOutlineEdit;
    case 'remove':
      return CgTrashEmpty;
  }
};

const QuickResourceActionStyle = ActionStyle.withComponent(LinkTag);
export default function QuickResourceAction({
  resource,
  action,
  collectionId,
  resourceId,
  onClick,
}: {
  resource: Resource;
  action: Action;
  collectionId?: Collection['id'];
  resourceId?: Collection['id'] | Link['id'];
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const { t } = useTranslation('common');
  const ActionIcon = getIconFromAction(action);

  return (
    <QuickResourceActionStyle
      href={appendCollectionId(
        appendResourceId(`/${resource}/${action}`, resourceId),
        collectionId
      )}
      title={t(`${resource}.${action}`)}
      onClick={onClick ? (event) => onClick(event) : undefined}
    >
      <ActionIcon />
    </QuickResourceActionStyle>
  );
}
