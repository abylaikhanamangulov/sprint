import styled, { css } from 'styled-components';

const Button = styled.button<{ $side: 'left' | 'right'; $disabled: boolean }>`
  flex: 1;
  min-width: 0;
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: 14px;
  background: ${({ $disabled }) =>
    $disabled
      ? '#1a1f2e'
      : 'linear-gradient(180deg, #303a52, #1a2138)'};
  border: 2px solid #11141c;
  color: ${({ $disabled, theme }) => ($disabled ? '#444c63' : theme.colors.textPrimary)};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  touch-action: none;
  user-select: none;
  /* slant the inner edge like a real paddle */
  ${({ $side }) =>
    $side === 'left'
      ? css`
          border-top-right-radius: 26px;
        `
      : css`
          border-top-left-radius: 26px;
        `}

  &:active {
    transform: scale(0.97);
    box-shadow: inset 0 4px 10px rgba(0, 0, 0, 0.6);
  }
`;

const Symbol = styled.span`
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
`;

const Label = styled.span`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  opacity: 0.8;
`;

interface Props {
  side: 'left' | 'right';
  disabled?: boolean;
  onShift: () => void;
}

export function Paddle({ side, disabled = false, onShift }: Props) {
  const isUp = side === 'right';
  return (
    <Button
      $side={side}
      $disabled={disabled}
      disabled={disabled}
      onPointerDown={(e) => {
        e.preventDefault();
        if (!disabled) onShift();
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Symbol>{isUp ? '+' : '−'}</Symbol>
      <Label>{isUp ? 'UP' : 'DOWN'}</Label>
    </Button>
  );
}
