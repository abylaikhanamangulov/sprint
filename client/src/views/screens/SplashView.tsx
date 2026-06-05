import { useEffect } from 'react';
import styled from 'styled-components';
import { Spinner } from '../ui';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100vh;
  height: 100dvh;
  background: linear-gradient(180deg, #0a0e1a 0%, #141829 100%);

  @media (min-width: 600px) {
    height: 100%;
  }
`;

const Logo = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.accent};
  letter-spacing: 2px;
  margin-bottom: 8px;
`;

interface Props {
  onDone: () => void;
}

export function SplashView({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <Wrap>
      <Logo>🏎️</Logo>
      <Title>DRAG RACING</Title>
      <p style={{ fontSize: 13, color: '#8890a8', marginBottom: 32 }}>Telegram Mini App</p>
      <Spinner />
      <p style={{ fontSize: 11, color: '#8890a8', marginTop: 16 }}>v1.0.0</p>
    </Wrap>
  );
}
