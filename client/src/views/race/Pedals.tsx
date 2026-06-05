import styled, { css } from 'styled-components';

const Pedal = styled.button<{ $variant: 'gas' | 'brake'; $pressed: boolean }>`
  width: 64px;
  height: 92px;
  border-radius: 10px 10px 14px 14px;
  background: linear-gradient(180deg, #3a4150, #20242f);
  border: 2px solid #11141c;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: ${({ $pressed }) =>
    $pressed ? 'inset 0 4px 10px rgba(0,0,0,0.6)' : '0 4px 10px rgba(0,0,0,0.5)'};
  transform: ${({ $pressed }) => ($pressed ? 'translateY(3px) scale(0.98)' : 'none')};
  transition: transform 0.06s, box-shadow 0.06s;

  /* metallic tread plate */
  &::before {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 6px;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.08) 0 4px,
      transparent 4px 8px
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  ${({ $variant }) =>
    $variant === 'gas'
      ? css`
          border-bottom: 4px solid #2ed57340;
        `
      : css`
          border-bottom: 4px solid #ff475740;
        `}
`;

const Glyph = styled.span`
  position: relative;
  z-index: 1;
  font-size: 20px;
  font-weight: 900;
  color: #cfd6ec;
`;

interface PedalProps {
  pressed: boolean;
  onPress: () => void;
  onRelease: () => void;
}

export function GasPedal({ pressed, onPress, onRelease }: PedalProps) {
  return (
    <Pedal
      $variant="gas"
      $pressed={pressed}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerLeave={() => pressed && onRelease()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Glyph>GAS</Glyph>
    </Pedal>
  );
}

export function BrakePedal({ pressed, onPress, onRelease }: PedalProps) {
  return (
    <Pedal
      $variant="brake"
      $pressed={pressed}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerLeave={() => pressed && onRelease()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Glyph>⊟</Glyph>
    </Pedal>
  );
}
