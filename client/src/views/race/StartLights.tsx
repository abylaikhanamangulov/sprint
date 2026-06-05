import styled, { keyframes } from 'styled-components';

interface Props {
  lit: number; // how many of the 5 reds are on
  out: boolean; // lights went out → GO
}

const Gantry = styled.div`
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(8, 10, 18, 0.82);
  border: 1px solid #2a3050;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
`;

const Pair = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Bulb = styled.div<{ $on: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ $on }) => ($on ? '#ff2e2e' : '#2a1014')};
  box-shadow: ${({ $on }) => ($on ? '0 0 12px 3px rgba(255,46,46,0.85)' : 'inset 0 0 4px rgba(0,0,0,0.8)')};
  transition: background 0.08s, box-shadow 0.08s;
`;

const flash = keyframes`
  0% { opacity: 0; transform: translateX(-50%) scale(0.7); }
  30% { opacity: 1; transform: translateX(-50%) scale(1.1); }
  100% { opacity: 0; transform: translateX(-50%) scale(1); }
`;

const Go = styled.div`
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  font-size: 44px;
  font-weight: 900;
  color: #2ed573;
  text-shadow: 0 0 18px rgba(46, 213, 115, 0.8);
  animation: ${flash} 0.9s ease forwards;
`;

export function StartLights({ lit, out }: Props) {
  if (out) return <Go>GO!</Go>;
  return (
    <Gantry>
      {[0, 1, 2, 3, 4].map((i) => (
        <Pair key={i}>
          <Bulb $on={i < lit} />
          <Bulb $on={i < lit} />
        </Pair>
      ))}
    </Gantry>
  );
}
