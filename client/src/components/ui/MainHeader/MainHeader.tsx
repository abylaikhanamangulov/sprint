import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
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

  return (
    <HeaderContainer>
      <MainRow>
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

