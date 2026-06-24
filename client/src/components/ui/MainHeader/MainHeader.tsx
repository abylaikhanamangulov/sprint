import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0 16px 0;
`;

const MainRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  line-height: 1;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

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
  const location = useLocation();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/hub');
    }
  };

  React.useEffect(() => {
    if (showClose) {
      window.Telegram?.WebApp.BackButton.show();
      const tgBack = () => {
        handleClose();
      };
      window.Telegram?.WebApp.BackButton.onClick(tgBack);
      return () => {
        window.Telegram?.WebApp.BackButton.offClick(tgBack);
        window.Telegram?.WebApp.BackButton.hide();
      };
    } else {
      window.Telegram?.WebApp.BackButton.hide();
    }
  }, [showClose, onClose]);

  const isHub = location.pathname === '/hub' || location.pathname === '/';
  const shouldShowBack = !isHub || showClose;

  return (
    <HeaderContainer>
      <MainRow>
        {shouldShowBack && (
          <BackBtn onClick={handleClose} title="Назад в меню">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </BackBtn>
        )}
        <TitleContainer>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </TitleContainer>
      </MainRow>
      
      {children && (
        <div style={{ marginTop: 12 }}>
          {children}
        </div>
      )}
    </HeaderContainer>
  );
};
