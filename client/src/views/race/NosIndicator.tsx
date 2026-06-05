import styled, { css, keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 10px 2px rgba(120, 80, 255, 0.7); }
  50% { box-shadow: 0 0 22px 6px rgba(160, 120, 255, 0.95); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const Tube = styled.div<{ $active: boolean; $ready: boolean }>`
  width: 22px;
  height: 96px;
  border-radius: 11px;
  background: #0a0e1a;
  border: 2px solid ${({ $ready }) => ($ready ? '#9b7bff' : '#2a3050')};
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  ${({ $active }) =>
    $active &&
    css`
      animation: ${pulse} 0.4s infinite;
    `}
`;

const Fill = styled.div<{ $pct: number; $active: boolean }>`
  width: 100%;
  height: ${({ $pct }) => Math.max(0, Math.min(100, $pct))}%;
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(180deg, #c4b5ff, #7c4dff)'
      : 'linear-gradient(180deg, #8a6bff, #5e3bd8)'};
  transition: height 0.1s linear;
`;

const Label = styled.div<{ $ready: boolean }>`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  color: ${({ $ready }) => ($ready ? '#b9a6ff' : '#5a6280')};
`;

interface Props {
  charge: number; // 0..100
  active: boolean;
}

export function NosIndicator({ charge, active }: Props) {
  const ready = charge >= 25;
  return (
    <Wrapper>
      <Tube $active={active} $ready={ready}>
        <Fill $pct={charge} $active={active} />
      </Tube>
      <Label $ready={ready}>NOS</Label>
    </Wrapper>
  );
}
