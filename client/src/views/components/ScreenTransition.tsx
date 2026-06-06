import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Loader } from '../ui';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #000;
  animation: ${fadeIn} 0.15s ease;
`;

export function ScreenTransition() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Only show loader once on initial app launch, disappear after 2 seconds
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <Overlay>
      <Loader />
    </Overlay>
  );
}
