import { styled } from '../vendors/stitches.ts';

export const Container = styled('div', { position: 'relative', height: '100%' });

export const ScrollableLayout = styled('div', {
  // chrome user-agent style override
  outline: 0,
  position: 'relative',
  backgroundColor: '#eee',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'row-reverse wrap',
  overflowY: 'auto',
  variants: {
    fullscreen: {
      true: {
        display: 'flex',
        position: 'fixed',
        top: 0,
        bottom: 0,
        overflow: 'auto',
      },
    },
  },
});
