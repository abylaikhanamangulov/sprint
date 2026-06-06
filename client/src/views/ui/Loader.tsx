import { memo } from 'react';
import styled, { keyframes } from 'styled-components';

const drawStroke = keyframes`
  to {
    stroke-dashoffset: 0;
  }
`;

const fadeInFill = keyframes`
  to {
    fill-opacity: 1;
    stroke-opacity: 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: radial-gradient(circle at 50% 40%, #1a1d29 0%, #05070a 100%);
  color: white;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const LogoWrapper = styled.div`
  width: 187px;
  height: 93px;
  position: relative;
  z-index: 1;
`;

const PATH_LENGTH = 1095;

const StyledSvg = styled.svg`
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;

  path {
    stroke: rgba(255, 255, 255, 0.9);
    stroke-width: 0.7;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: #D9D9D9;
    fill-opacity: 0;
    will-change: stroke-dashoffset, fill-opacity, stroke-opacity;
    transform: translateZ(0);
    
    stroke-dasharray: ${PATH_LENGTH};
    stroke-dashoffset: ${PATH_LENGTH};
    animation: 
      ${drawStroke} 1s linear forwards,
      ${fadeInFill} 0.4s ease-in-out 0.8s forwards;
  }
`;

export const Loader = memo(function Loader() {
  return (
    <Container>
      <LogoWrapper>
        <StyledSvg viewBox="0 0 187 93" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M72.7041 18.5605H19.0723C18.9016 18.5605 18.7302 18.6457 18.5596 18.8164C18.4744 18.9018 18.4316 19.0724 18.4316 19.3281V36.0957C18.4316 36.2664 18.4742 36.4377 18.5596 36.6084C18.7302 36.6937 18.9016 36.7363 19.0723 36.7363H73.7275C77.0554 36.7363 80.0849 37.5894 82.8154 39.2959C85.6314 40.9172 87.893 43.1362 89.5996 45.9521C91.3062 48.7681 92.1601 51.84 92.1602 55.168V73.7285C92.1601 77.1417 91.3062 80.2564 89.5996 83.0723C87.893 85.8028 85.6314 88.0219 82.8154 89.7285C80.0849 91.3496 77.0553 92.1602 73.7275 92.1602H18.3037C14.9758 92.1601 11.9038 91.3498 9.08789 89.7285C6.27189 88.0219 4.05297 85.8029 2.43164 83.0723C0.810374 80.2564 5.70761e-05 77.1417 0 73.7285V65.9199H18.4316V72.832C18.4316 73.0878 18.4744 73.3011 18.5596 73.4717C18.7302 73.557 18.9016 73.6006 19.0723 73.6006H72.7041C72.8747 73.6006 73.0452 73.557 73.2158 73.4717C73.3864 73.301 73.4717 73.0879 73.4717 72.832V56.0645C73.4717 55.8938 73.3865 55.765 73.2158 55.6797C73.0453 55.5093 72.8746 55.4239 72.7041 55.4238H18.3037C14.9758 55.4238 11.9038 54.6135 9.08789 52.9922C6.27189 51.2855 4.05297 49.024 2.43164 46.208C0.810396 43.3921 5.57527e-06 40.3201 0 36.9922V18.4326C0 15.0193 0.810307 11.9465 2.43164 9.21582C4.05293 6.39994 6.27202 4.18184 9.08789 2.56055C11.9038 0.853913 14.9758 3.09736e-05 18.3037 0H73.7275H99.5254L168.275 0C171.608 0 174.734 1.01404 177.401 2.7207C180.15 4.34193 182.358 6.56035 184.025 9.37598C185.692 12.192 186.525 15.2648 186.525 18.5928V37.0645C186.525 40.4254 185.691 43.5278 184.025 46.3716C182.358 49.1292 180.15 51.3702 177.401 53.0938C174.734 54.7312 171.733 55.5505 168.4 55.5505L117.957 55.6797V92.1924H99.5254V37.82C99.5898 37.0072 99.8515 36.8665 100.525 36.8061H118.726H167.525C167.775 36.8061 167.942 36.7631 168.025 36.6769C168.192 36.5047 168.275 36.3324 168.275 36.1602V19.3604C168.275 19.1044 168.192 18.934 168.025 18.8486C167.942 18.678 167.775 18.5928 167.525 18.5928H118.726H99.5254L72.7041 18.5605Z" />
        </StyledSvg>
      </LogoWrapper>
    </Container>
  );
});
