import { styled } from '../vendors/stitches.ts';

export const Container = styled('div', { position: 'relative', height: '100%' });

export const UiLayer = styled('div', {
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  pointerEvents: 'none',
  '> *': {
    pointerEvents: 'auto',
  },
});

export const ScrollableLayout = styled('div', {
  // chrome user-agent style override
  outline: 0,
  position: 'relative',
  backgroundColor: '#eee',
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
