import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ModalOverlay = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  animation: ${fadeIn} 0.3s ease-out;
  opacity: ${({ $isClosing }) => ($isClosing ? 0 : 1)};
  transition: opacity 0.3s ease-out;
`;

const ModalContent = styled.div<{ $isClosing: boolean }>`
  background: #111111;
  width: 100%;
  max-height: 85vh;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  animation: ${slideUp} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform: ${({ $isClosing }) => ($isClosing ? 'translateY(100%)' : 'translateY(0)')};
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
`;



export interface BottomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  children: React.ReactNode;
}

export const BottomModal: React.FC<BottomModalProps> = ({ isOpen, onClose, title, children }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 350); // wait for animation to complete
  };

  if (!isOpen && !isClosing) return null;

  return (
    <ModalOverlay $isClosing={isClosing} onClick={handleClose}>
      <ModalContent $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
        </Header>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};
