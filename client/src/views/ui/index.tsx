import styled, { css } from 'styled-components';
import type { CarClass } from '../../models/types';

export * from './Loader';

// ── Layout ─────────────────────────────────────────────────────────────────
export const Screen = styled.div`
  flex: 1;
  padding: 16px;
  padding-bottom: calc(84px + env(safe-area-inset-bottom));
  animation: fadeIn 0.3s ease;
`;

export const CenteredFill = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100vh;
  height: 100dvh;

  @media (min-width: 600px) {
    height: 100%;
  }
`;

export const Row = styled.div<{ $justify?: string; $align?: string; $gap?: number }>`
  display: flex;
  align-items: ${({ $align }) => $align ?? 'center'};
  justify-content: ${({ $justify }) => $justify ?? 'flex-start'};
  gap: ${({ $gap }) => ($gap ?? 0)}px;
`;

export const Column = styled.div<{ $gap?: number; $align?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => ($gap ?? 0)}px;
  ${({ $align }) => $align && css`align-items: ${$align};`}
`;

export const Grid = styled.div<{ $cols?: number; $gap?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols ?? 2}, 1fr);
  gap: ${({ $gap }) => ($gap ?? 12)}px;
`;

export const ScrollRow = styled.div<{ $gap?: number }>`
  display: flex;
  gap: ${({ $gap }) => ($gap ?? 10)}px;
  overflow-x: auto;
  padding-bottom: 12px;
`;

// ── Card ─────────────────────────────────────────────────────────────────────
export const Card = styled.div<{ $selected?: boolean; $clickable?: boolean }>`
  background: ${({ theme }) => theme.colors.bgCard};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 16px;
  border: 1px solid ${({ $selected, theme }) =>
    $selected ? theme.colors.accent : theme.colors.border};
  ${({ $clickable }) => $clickable && css`cursor: pointer;`}
  transition: all 0.2s ease-in-out;

  &:hover {
    ${({ $clickable, theme }) => $clickable && css`
      background: ${theme.colors.bgCardHover};
      border-color: rgba(255, 255, 255, 0.2);
    `}
  }
`;

// ── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'danger' | 'outline';

export const Button = styled.button<{
  $variant?: ButtonVariant;
  $size?: 'sm' | 'md';
  $block?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  letter-spacing: -0.2px;
  transition: all 0.15s ease-in-out;
  ${({ $size }) =>
    $size === 'sm'
      ? css`padding: 8px 16px; font-size: 13px; border-radius: 8px;`
      : css`padding: 14px 24px; font-size: 16px; border-radius: 12px;`}
  ${({ $block }) => $block && css`width: 100%;`}

  ${({ $variant = 'primary', theme }) => {
    switch ($variant) {
      case 'danger':
        return css`
          background: ${theme.colors.red};
          color: white;
          &:hover { background: #dc2626; }
        `;
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.colors.textPrimary};
          border: 1px solid ${theme.colors.border};
          &:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.15);
          }
        `;
      default:
        return css`
          background: ${theme.colors.accent};
          color: #000000;
          &:hover {
            background: ${theme.colors.accentHover};
            transform: scale(0.98);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active {
    transform: scale(0.96);
  }
`;

// ── Badge ────────────────────────────────────────────────────────────────────
export const Badge = styled.span<{ $bg?: string; $color?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 11px;
  font-weight: 700;
  background: ${({ $bg }) => $bg ?? '#666'};
  color: ${({ $color }) => $color ?? 'white'};
`;

export const ClassBadge = styled(Badge).attrs<{ $class: CarClass }>(({ $class, theme }) => ({
  $bg: $class === 'S' || $class === 'X' ? undefined : theme.classColors[$class],
  $color: $class === 'S' ? '#1a1a2e' : $class === 'X' ? '#04201d' : 'white',
}))<{ $class: CarClass }>`
  ${({ $class }) =>
    $class === 'S' &&
    css`
      background: linear-gradient(135deg, #ffd700, #ff8c00);
    `}
  ${({ $class }) =>
    $class === 'X' &&
    css`
      background: linear-gradient(135deg, #00e5d0, #4e7cff);
    `}
`;

// ── Progress ─────────────────────────────────────────────────────────────────
export const ProgressBar = styled.div<{ $height?: number }>`
  width: 100%;
  height: ${({ $height }) => $height ?? 6}px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border-radius: 3px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $pct: number; $bg?: string }>`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: ${({ $bg, theme }) => $bg ?? theme.colors.accent};
  transition: width 0.3s ease-out;
`;

// ── Text helpers ─────────────────────────────────────────────────────────────
export const Heading = styled.h2<{ $size?: number }>`
  font-size: ${({ $size }) => $size ?? 18}px;
  font-weight: 700;
`;

export const Muted = styled.span<{ $size?: number }>`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ $size }) => $size ?? 13}px;
`;

export const Stars = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  letter-spacing: 2px;
`;

// ── Inputs ───────────────────────────────────────────────────────────────────
export const TextInput = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgPrimary};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bgPrimary};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Range = styled.input.attrs({ type: 'range' })`
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border-radius: 3px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    cursor: pointer;
  }
`;

// ── Misc ─────────────────────────────────────────────────────────────────────
export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Toggle = styled.button<{ $on: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: ${({ $on, theme }) => ($on ? theme.colors.accent : '#444')};
  position: relative;
  transition: background 0.2s;
  flex: 0 0 auto;

  &::after {
    content: '';
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 3px;
    left: ${({ $on }) => ($on ? '23px' : '3px')};
    transition: left 0.2s;
  }
`;
