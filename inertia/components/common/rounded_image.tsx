import styled from '@emotion/styled';

const RoundedImage = styled.img({
  'borderRadius': '50%',

  '&:hover': {
    boxShadow: '0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1)',
  },
});

export default RoundedImage;
