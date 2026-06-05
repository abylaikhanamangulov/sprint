import styled, { css, keyframes } from 'styled-components';

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

type LightColor = { bg: string; glow: string };

function colorFor(perfect: boolean, good: boolean, over: boolean): LightColor | null {
  if (over) return { bg: '#ff4757', glow: 'rgba(255,71,87,0.85)' };
  if (perfect) return { bg: '#2ed573', glow: 'rgba(46,213,115,0.85)' };
  if (good) return { bg: '#2d8cf0', glow: 'rgba(45,140,240,0.85)' };
  return null;
}

const Light = styled.div<{ $c: LightColor | null; $blink: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #0a0e1a;
  background: ${({ $c }) => ($c ? $c.bg : '#1a2236')};
  box-shadow: ${({ $c }) =>
    $c ? `0 0 14px 3px ${$c.glow}` : 'inset 0 0 6px rgba(0,0,0,0.6)'};
  ${({ $blink }) =>
    $blink &&
    css`
      animation: ${blink} 0.25s infinite;
    `}
  transition: background 0.08s, box-shadow 0.08s;
`;

interface Props {
  perfect: boolean;
  good: boolean;
  over: boolean;
}

export function ShiftLight({ perfect, good, over }: Props) {
  return <Light $c={colorFor(perfect, good, over)} $blink={over} />;
}
