/** @jsx createElement */
import { createElement } from '../vendors/react.ts';
import { styled } from '../vendors/stitches.ts';

const Svg = styled('svg', {
  position: 'fixed',
  top: '8px',
  right: '8px',
});

const Circle = styled('circle', {
  transition: 'stroke-dashoffset 0.35s',
  transform: 'rotate(-90deg)',
  transformOrigin: '50% 50%',
  stroke: 'url(#aEObn)',
  fill: '#fff8',
});

const GradientDef = (
  <defs>
    <linearGradient id="aEObn" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style={{ stopColor: '#53baff', stopOpacity: 1 }} />
      <stop offset="100%" style={{ stopColor: '#0067bb', stopOpacity: 1 }} />
    </linearGradient>
  </defs>
);

const CenterText = styled('text', {
  dominantBaseline: 'middle',
  textAnchor: 'middle',
  fontSize: '30px',
  fontWeight: 'bold',
  fill: '#004b9e',
});

export const CircularProgress = (
  props: {
    radius: number;
    strokeWidth: number;
    value: number;
    text?: string;
  } & Record<string, unknown>,
) => {
  const { radius, strokeWidth, value, text, ...otherProps } = props;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - value * circumference;
  const center = radius + strokeWidth / 2;
  const side = center * 2;

  return (
    <Svg height={side} width={side} {...otherProps}>
      {GradientDef}
      <Circle
        {...{
          strokeWidth,
          strokeDasharray: `${circumference} ${circumference}`,
          strokeDashoffset,
          r: radius,
          cx: center,
          cy: center,
        }}
      />
      <CenterText x="50%" y="50%">
        {text || ''}
      </CenterText>
    </Svg>
  );
};
