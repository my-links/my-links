import styled from '@emotion/styled';
import TransitionLayout from '~/components/layouts/_transition_layout';

const DropdownContainer = styled(TransitionLayout)<{ show: boolean }>(
  ({ show, theme }) => ({
    zIndex: 99,
    position: 'absolute',
    top: 'calc(100% + 0.5em)',
    right: 0,
    minWidth: '175px',
    backgroundColor: show ? theme.colors.secondary : theme.colors.background,
    border: `2px solid ${theme.colors.secondary}`,
    borderRadius: theme.border.radius,
    boxShadow: theme.colors.boxShadow,
    display: show ? 'flex' : 'none',
    flexDirection: 'column',
    overflow: 'hidden',
  })
);

export default DropdownContainer;
