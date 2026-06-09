import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from 'src/models/store';
import { PATHS } from 'src/routes/paths';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0 24px 0;
  padding-top: calc(16px + env(safe-area-inset-top));
`;

const TopRow = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
`;

const CloseButton = styled.button`
  background: #2a2a2a;
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #3a3a3a;
  }
`;

const MainRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  line-height: 1;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: #444;
  margin: 0;
`;

const BalanceBadge = styled.div`
  background: #1a1a1a;
  border-radius: 24px;
  padding: 6px 6px 6px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2a2a2a;
  }
`;

const BalanceText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  margin-right: 4px;
`;

const PlusCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #cfff04;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-size: 18px;
  font-weight: 700;
`;

// Simple plus SVG
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1V13M1 7H13" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

import coinIcon from 'src/components/icons/assets/coin.svg';

interface MainHeaderProps {
  title: string;
  subtitle?: string;
  showClose?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ 
  title, 
  subtitle, 
  showClose = false, 
  onClose,
  children
}) => {
  const navigate = useNavigate();
  const user = useGameStore((state) => state.user);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <HeaderContainer>
      {showClose && (
        <TopRow>
          <CloseButton onClick={handleClose}>
            ✕ Close
          </CloseButton>
        </TopRow>
      )}
      
      <MainRow>
        <TitleContainer>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </TitleContainer>
        
        {user && (
          <BalanceBadge onClick={() => navigate(PATHS.COIN_SHOP)}>
            <img src={coinIcon} alt="coin" style={{ width: 22, height: 22 }} />
            <BalanceText>
              {user.coins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </BalanceText>
            <PlusCircle>
              <PlusIcon />
            </PlusCircle>
          </BalanceBadge>
        )}
      </MainRow>
      
      {children && (
        <div style={{ marginTop: 16 }}>
          {children}
        </div>
      )}
    </HeaderContainer>
  );
};
