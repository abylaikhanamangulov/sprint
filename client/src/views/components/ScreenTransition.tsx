import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGameStore } from '../../models/store';

const TIPS: string[] = [
  'Прогревай шины перед стартом — холодная резина буксует.',
  'Переключайся в зелёной зоне тахометра для идеального переключения.',
  'Не повышай передачу слишком рано — мотор провалится по тяге.',
  'Синяя зона — «хорошо», зелёная — «отлично».',
  'Полный привод (AWD) цепляется на старте лучше заднего.',
  'Береги NOS для второй половины дистанции.',
  'В свободном заезде можно без помех вывести идеальную формулу разгона.',
  'Чем выше передача, тем уже окно переключения.',
  'Перегретые шины тоже буксуют — не передержи газ на прогреве.',
  'Прокачивай двигатель и сцепление в гараже, чтобы выжать максимум.',
];

const TRANSITION_MS = 750;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const grow = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 32px;
  background: linear-gradient(180deg, #0a0e1a 0%, #141829 100%);
  animation: ${fadeIn} 0.15s ease;
`;

const Logo = styled.div`
  font-size: 44px;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.accent};
`;

const BarTrack = styled.div`
  width: min(280px, 70%);
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.bgCard};
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.green});
  animation: ${grow} ${TRANSITION_MS}ms ease-out forwards;
`;

const TipBox = styled.div`
  max-width: 320px;
  text-align: center;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TipLabel = styled.span`
  color: ${({ theme }) => theme.colors.gold};
  font-weight: 700;
`;

export function ScreenTransition() {
  const screen = useGameStore((s) => s.selectedScreen);
  const [visible, setVisible] = useState(false);
  const [tip, setTip] = useState(TIPS[0]);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return; // no loader on the very first paint
    }
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), TRANSITION_MS);
    return () => clearTimeout(t);
  }, [screen]);

  if (!visible) return null;

  return (
    <Overlay>
      <Logo>🏎️</Logo>
      <Title>DRAG RACING</Title>
      <BarTrack>
        <BarFill />
      </BarTrack>
      <TipBox>
        <TipLabel>Совет: </TipLabel>
        {tip}
      </TipBox>
    </Overlay>
  );
}
