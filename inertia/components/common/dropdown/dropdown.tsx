import KEYS from '#constants/keys';
import styled from '@emotion/styled';
import { ReactNode, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import DropdownContainer from '~/components/common/dropdown/dropdown_container';
import DropdownLabel from '~/components/common/dropdown/dropdown_label';
import useClickOutside from '~/hooks/use_click_outside';
import useGlobalHotkeys from '~/hooks/use_global_hotkeys';
import useToggle from '~/hooks/use_modal';

const DropdownStyle = styled.div<{ opened: boolean }>(({ opened, theme }) => ({
  cursor: 'pointer',
  userSelect: 'none',
  position: 'relative',
  minWidth: 'fit-content',
  width: 'fit-content',
  maxWidth: '250px',
  backgroundColor: opened ? theme.colors.secondary : theme.colors.background,
  padding: '4px',
  borderRadius: theme.border.radius,

  '&:hover': {
    backgroundColor: theme.colors.secondary,
  },

  '& svg': {
    height: '24px',
    width: '24px',
  },
}));

export default function Dropdown({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: ReactNode | string;
  className?: string;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isShowing, toggle, close } = useToggle();
  const { globalHotkeysEnabled } = useGlobalHotkeys();

  useClickOutside(dropdownRef, close);

  useHotkeys(KEYS.ESCAPE_KEY, close, {
    enabled: globalHotkeysEnabled,
    enableOnFormTags: ['INPUT'],
  });

  return (
    <DropdownStyle
      opened={isShowing}
      onClick={toggle}
      ref={dropdownRef}
      className={className}
    >
      <DropdownLabel>{label}</DropdownLabel>
      <DropdownContainer show={isShowing}>{children}</DropdownContainer>
    </DropdownStyle>
  );
}
