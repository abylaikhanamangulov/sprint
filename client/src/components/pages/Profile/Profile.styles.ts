import styled from 'styled-components';

export const MaskIcon = styled.div<{ $src: string; $color?: string; $size?: number }>`
  display: inline-block;
  width: ${({ $size }) => $size || 24}px;
  height: ${({ $size }) => $size || 24}px;
  background-color: ${({ theme, $color }) => $color || theme.colors.textPrimary};
  -webkit-mask-image: url("${({ $src }) => $src}");
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-image: url("${({ $src }) => $src}");
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
`;

export const ProfileTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  padding-top: calc(16px + env(safe-area-inset-top));
  margin-bottom: 20px;
`;

export const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const TopRight = styled.div`
  display: flex;
  align-items: center;
`;

export const BalanceBadge = styled.div`
  background: #1C1C1C;
  border-radius: 24px;
  padding: 6px 6px 6px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: 0.3px;
`;

export const IconButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const BellBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: ${({ theme }) => theme.colors.accent};
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.bgPrimary};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const AvatarWrap = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px dashed ${({ theme }) => theme.colors.accent};
  padding: 5px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  color: white;
  overflow: hidden;
`;

export const StatRowTop = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 36px;
  margin-bottom: 32px;
  padding: 0 10px;
`;

export const StatBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 15%;
    height: 70%;
    width: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const StatVal = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
