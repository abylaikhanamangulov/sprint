import styled, { keyframes } from 'styled-components';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const fadeIn = keyframes`
  from { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
`;

const fadeOut = keyframes`
  from { opacity: 1; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
  to { opacity: 0; backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideDown = keyframes`
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(100%); opacity: 0; }
`;

const Overlay = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 16px 32px 16px;
  box-sizing: border-box;
  animation: ${({ $isClosing }) => ($isClosing ? fadeOut : fadeIn)} 0.3s ease-out forwards;
`;

const ModalContainer = styled.div<{ $isClosing: boolean }>`
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: rgba(30, 30, 45, 0.7);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 32px;
  padding: 32px 24px 24px;
  position: relative;
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
  animation: ${({ $isClosing }) => ($isClosing ? slideDown : slideUp)} 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  img {
    max-width: 140px;
    object-fit: contain;
    filter: drop-shadow(0 15px 20px rgba(0,0,0,0.4));
  }
  
  svg {
    width: 64px;
    height: 64px;
    color: #ffffff;
  }
`;

const Title = styled.h2`
  font-size: 1.35rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.02em;
`;

const Description = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 28px 0;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ActionButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &.primary {
    background: #ffffff;
    color: #000000;
    border: none;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: #f0f0f0;
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
    }
  }
`;

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  imageSrc?: string;
  actionText?: string;
  onAction?: () => void;
  primaryAction?: boolean;
}

export function GlassModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  imageSrc,
  actionText,
  onAction,
  primaryAction = true,
}: GlassModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (render) {
      setIsClosing(true);
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setRender(false);
        setIsClosing(false);
      }, 400); // Wait for close animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, render]);

  // Clean up overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 350); // Give time for animation to finish before notifying parent
  };

  if (!render) return null;

  return (
    <Overlay $isClosing={isClosing} onClick={handleClose}>
      <ModalContainer $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} aria-label="Закрыть">
          <X size={18} strokeWidth={2.5} />
        </CloseButton>
        
        {(icon || imageSrc) && (
          <IconWrapper>
            {imageSrc ? <img src={imageSrc} alt="" /> : icon}
          </IconWrapper>
        )}
        
        {title && <Title>{title}</Title>}
        {description && <Description>{description}</Description>}
        
        {actionText && (
          <ActionButton 
            className={primaryAction ? 'primary' : ''} 
            onClick={() => {
              if (onAction) onAction();
              handleClose();
            }}
          >
            {actionText}
          </ActionButton>
        )}
      </ModalContainer>
    </Overlay>
  );
}
