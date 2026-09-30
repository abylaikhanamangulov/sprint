import { useEffect } from 'react';
import styled from 'styled-components';
import { useGameStore } from 'src/models/store';
import { useRaceViewModel, RACE_LENGTHS, OVERHEAT_LIMIT } from 'src/components/pages/Race/RaceViewModel';
import type { Drivetrain } from 'src/models/types';
import { Screen, Card, Button, Column, Heading, Muted, Stars, ClassBadge } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';
import coinIcon from 'src/components/icons/assets/coin.svg';
import { CarSprite } from 'src/views/components/CarSprite';
import { Tachometer } from 'src/views/race/Tachometer';
import { Speedometer } from 'src/views/race/Speedometer';
import { ShiftLight } from 'src/views/race/ShiftLight';
import { NosIndicator } from 'src/views/race/NosIndicator';
import { Paddle } from 'src/views/race/Paddle';
import { GasPedal, BrakePedal } from 'src/views/race/Pedals';
import { RaceTrack } from 'src/views/race/RaceTrack';
import { RaceHud } from 'src/views/race/RaceHud';
import { BurnoutGauge } from 'src/views/race/BurnoutGauge';
import { StartLights } from 'src/views/race/StartLights';

const RaceLayout = styled.div`
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  background: ${({ theme }) => theme.colors.bgPrimary};

  @media (min-width: 600px) {
    height: 100%;
  }
`;

const Gauges = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 6px 0;
`;

const PedalCluster = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex: 0 0 auto;
`;

const TrackWrap = styled.div`
  position: relative;
`;

const ResultIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  text-align: center;
`;

const ShiftPill = styled.span<{ $q: 'perfect' | 'good' | 'miss' }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  background: ${({ $q, theme }) =>
    $q === 'perfect' ? theme.colors.green : $q === 'good' ? theme.colors.orange : theme.colors.red};
`;

const NosButton = styled.button<{ $ready: boolean }>`
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  font-weight: 900;
  color: ${({ $ready }) => ($ready ? '#1a1a2e' : '#666')};
  background: ${({ $ready }) =>
    $ready ? 'linear-gradient(135deg, #c4b5ff, #7c4dff)' : '#222'};
`;

const TempWrap = styled.div`
  margin: 8px 0;
`;

const Hint = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px 0;
`;

const LaunchBtn = styled(Button)`
  flex: 1;
  min-width: 65px;
  font-variant-numeric: tabular-nums;
  height: 96px;
  font-size: 18px;
`;

// РІвЂќР‚РІвЂќР‚ Free-run telemetry РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
const TeleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;
const Tele = styled.div`
  text-align: center;
  flex: 1;
  strong {
    display: block;
    font-size: 18px;
    font-weight: 800;
  }
  span {
    font-size: 10px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const DRIVETRAIN_LABEL: Record<Drivetrain, string> = {
  fwd: 'FWD Р’В· Р С—Р ВµРЎР‚Р ВµР Т‘Р Р…Р С‘Р в„–',
  rwd: 'RWD Р’В· Р В·Р В°Р Т‘Р Р…Р С‘Р в„–',
  awd: 'AWD Р’В· Р С—Р С•Р В»Р Р…РЎвЂ№Р в„–',
};

// РІвЂќР‚РІвЂќР‚ Pre-race "VS" panel РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
const VsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 420px;
  margin: 0 auto;
`;
const Fighter = styled(Card)<{ $side: 'you' | 'foe' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid ${({ $side, theme }) => ($side === 'you' ? theme.colors.accent : theme.colors.red)};
  background: ${({ $side }) =>
    $side === 'you'
      ? 'linear-gradient(100deg, rgba(78,124,255,0.18), #1c2137 60%)'
      : 'linear-gradient(260deg, rgba(255,71,87,0.18), #1c2137 60%)'};
`;
const FighterSprite = styled.div`
  width: 120px;
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
`;
const FighterInfo = styled.div<{ $right?: boolean }>`
  flex: 1;
  min-width: 0;
  text-align: ${({ $right }) => ($right ? 'right' : 'left')};
`;
const VsBadge = styled.div`
  align-self: center;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 2px;
  color: ${({ theme }) => theme.colors.gold};
  text-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
`;
const Tag = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 2px;
`;
const FName = styled.div`
  font-size: 17px;
  font-weight: 800;
`;

// РІвЂќР‚РІвЂќР‚ Overheat warning bar (in race) РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
const HeatWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
`;
const HeatTrack = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #1c2137;
  overflow: hidden;
`;
const HeatFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, $pct)}%;
  background: linear-gradient(90deg, #ffa502, #ff4757);
  transition: width 0.1s linear;
`;

const BURNOUT_HINT =
  'Р вЂњР В°Р В·Р С•Р С Р Т‘Р ВµРЎР‚Р В¶Р С‘ РЎРѓРЎвЂљРЎР‚Р ВµР В»Р С”РЎС“ Р Р† Р В·Р ВµР В»РЎвЂР Р…Р С•Р в„– Р В·Р С•Р Р…Р Вµ. Р вЂ”Р С•Р Р…Р В° РЎС“РЎвЂ¦Р С•Р Т‘Р С‘РЎвЂљ Р Р†Р В»Р ВµР Р†Р С• Р С‘ РЎРѓРЎС“Р В¶Р В°Р ВµРЎвЂљРЎРѓРЎРЏ РІР‚вЂќ РЎРѓР В±РЎР‚Р В°РЎРѓРЎвЂ№Р Р†Р В°Р в„– Р С‘ Р С—Р С•Р Т‘РЎвЂ№Р С–РЎР‚РЎвЂ№Р Р†Р В°Р в„– Р С–Р В°Р В·Р С•Р С. Р В§Р ВµР С Р Р†РЎвЂ№РЎв‚¬Р Вµ Р С—РЎР‚Р С•Р С–РЎР‚Р ВµР Р†, РЎвЂљР ВµР С Р В»РЎС“РЎвЂЎРЎв‚¬Р Вµ РЎРѓРЎвЂљР В°РЎР‚РЎвЂљ.';

export function RaceView() {
  const vm = useRaceViewModel();
  const userName = useGameStore((s) => s.user?.firstName) || 'Р СћРЎвЂ№';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        vm.setThrottle(true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        vm.setBrake(true);
      } else if (e.code === 'KeyS' && !e.repeat) {
        e.preventDefault();
        vm.shiftDown();
      } else if (e.code === 'KeyW' && !e.repeat) {
        e.preventDefault();
        vm.shiftUp();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        vm.setThrottle(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        vm.setBrake(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [vm]);

  const userEnergy = useGameStore((s) => s.user?.energy) || 0;

  // РІвЂќР‚РІвЂќР‚ MENU РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
  if (vm.phase === 'menu') {
    const car = vm.selectedCar;
    return (
      <Screen>
        <MainHeader title="Р вЂњР С•Р Р…Р С”Р С‘" />
        <Column $gap={12} style={{ maxWidth: 300, margin: '0 auto' }}>
          <Button 
            $variant="primary" 
            $block 
            onClick={vm.chooseRace}
            disabled={userEnergy < 1 || !car}
          >
            СЂСџРЏРѓ Р вЂ”Р В°Р ВµР В·Р Т‘ (PvE) {!car ? '(Р СњРЎС“Р В¶Р Р…Р С• Р В°Р Р†РЎвЂљР С•)' : userEnergy < 1 ? '(Р СњР ВµРЎвЂљ РЎРЊР Р…Р ВµРЎР‚Р С–Р С‘Р С‘)' : ''}
          </Button>
          <Button $variant="primary" $block onClick={vm.chooseFree} disabled={!car}>
            РІв„ўС•РїС‘РЏ Р РЋР Р†Р С•Р В±Р С•Р Т‘Р Р…РЎвЂ№Р в„– Р В·Р В°Р ВµР В·Р Т‘ {!car && '(Р СњРЎС“Р В¶Р Р…Р С• Р В°Р Р†РЎвЂљР С•)'}
          </Button>
          <Button $variant="outline" $block disabled>
            РІС™вЂќРїС‘РЏ PvP (РЎРѓР С”Р С•РЎР‚Р С•)
          </Button>
        </Column>
        {car && (
          <Card style={{ maxWidth: 300, margin: '16px auto' }}>
            <Muted>Р СћР ВµР С”РЎС“РЎвЂ°Р С‘Р в„– Р В°Р Р†РЎвЂљР С•</Muted>
            <div style={{ fontWeight: 600 }}>{car.car.name}</div>
            <div style={{ color: '#4e7cff' }}>PP {car.currentPP}</div>
            <Muted $size={11} style={{ display: 'block', marginTop: 4 }}>
              {DRIVETRAIN_LABEL[car.car.drivetrain]} Р’В· {car.car.maxGears}-РЎРѓРЎвЂљ.
            </Muted>
          </Card>
        )}
      </Screen>
    );
  }

  // РІвЂќР‚РІвЂќР‚ DISTANCE SELECT (race or free run) РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
  if (vm.phase === 'select') {
    return (
      <Screen style={{ textAlign: 'center', paddingTop: 40 }}>
        <Heading style={{ marginBottom: 6 }}>Р вЂ™РЎвЂ№Р В±Р С•РЎР‚ Р Т‘Р С‘РЎРѓРЎвЂљР В°Р Р…РЎвЂ Р С‘Р С‘</Heading>
        <Muted style={{ display: 'block', marginBottom: 20 }}>
          {vm.selectMode === 'free' ? 'РІв„ўС•РїС‘РЏ Р РЋР Р†Р С•Р В±Р С•Р Т‘Р Р…РЎвЂ№Р в„– Р В·Р В°Р ВµР В·Р Т‘' : 'PvE РІР‚вЂќ Р Р…Р В° Р Р†РЎР‚Р ВµР СРЎРЏ'}
        </Muted>
        <Column $gap={12} style={{ maxWidth: 320, margin: '0 auto' }}>
          {RACE_LENGTHS.map((d) => (
            <Card key={d.id} $clickable onClick={() => vm.startSelected(d.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>Р вЂР ВµРЎРѓР С”Р С•Р Р…Р ВµРЎвЂЎР Р…РЎвЂ№Р в„–</span>
                <span style={{ color: '#4e7cff', fontWeight: 700 }}>РІв‚¬С›</span>
              </div>
            </Card>
          ))}
          {vm.selectMode === 'free' && (
            <Card $clickable onClick={() => vm.startSelected('endless')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>Бесконечный</span>
                  <span style={{ color: '#4e7cff', fontWeight: 700 }}>∞</span>
                </div>
              </Card>
          )}
          <Button $variant="outline" $block onClick={vm.cancelSelect}>
            Р СњР В°Р В·Р В°Р Т‘
          </Button>
        </Column>
      </Screen>
    );
  }

  // РІвЂќР‚РІвЂќР‚ INTRO: VS panel (opponent nick + car) РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
  if (vm.phase === 'intro') {
    const you = vm.selectedCar;
    const foe = vm.opponent;
    return (
      <Screen style={{ paddingTop: 28 }}>
        <Heading style={{ textAlign: 'center', marginBottom: 4 }}>
          {vm.mode === 'war' ? 'РІС™вЂќРїС‘РЏ Р вЂ”Р В°Р ВµР В·Р Т‘ Р Р†Р С•Р в„–Р Р…РЎвЂ№' : 'Р вЂ”Р В°Р ВµР В·Р Т‘'}
        </Heading>
        <Muted style={{ display: 'block', textAlign: 'center', marginBottom: 18 }}>
          {RACE_LENGTHS.find((d) => d.id === vm.raceLength)?.sub} Р’В· {vm.raceLength === 'quarter' ? 'Р’С Р СР С‘Р В»Р С‘' : ''}
        </Muted>

        <VsWrap>
          {you && (
            <Fighter $side="you">
              <FighterSprite>
                <CarSprite car={you.car} width={120} cosmetics={you.cosmetics} />
              </FighterSprite>
              <FighterInfo $right>
                <Tag>Р СћРЎвЂ№</Tag>
                <FName>{userName}</FName>
                <div style={{ marginTop: 4 }}>
                  <ClassBadge $class={you.car.class}>{you.car.class}</ClassBadge>{' '}
                  <Muted $size={12}>{you.car.name}</Muted>
                </div>
              </FighterInfo>
            </Fighter>
          )}

          <VsBadge>VS</VsBadge>

          {foe && (
            <Fighter $side="foe">
              <FighterSprite>
                <CarSprite car={foe.car} width={120} cosmetics={foe.cosmetics} />
              </FighterSprite>
              <FighterInfo>
                <Tag>{vm.mode === 'war' ? 'Р СџРЎР‚Р С‘Р В·РЎР‚Р В°Р С” Р С”Р В»Р В°Р Р…Р В°-РЎРѓР С•Р С—Р ВµРЎР‚Р Р…Р С‘Р С”Р В°' : 'Р РЋР С•Р С—Р ВµРЎР‚Р Р…Р С‘Р С”'}</Tag>
                <FName>{foe.name}</FName>
                <div style={{ marginTop: 4 }}>
                  <ClassBadge $class={foe.car.class}>{foe.car.class}</ClassBadge>{' '}
                  <Muted $size={12}>{foe.car.name}</Muted>
                </div>
                {vm.mode === 'war' && (
                  <Muted $size={11} style={{ display: 'block', marginTop: 4 }}>
                    Р В¦Р ВµР В»РЎРЉ: Р С•Р В±Р С•Р С–Р Р…Р В°РЎвЂљРЎРЉ {foe.targetTime.toFixed(3)}РЎРѓ
                  </Muted>
                )}
              </FighterInfo>
            </Fighter>
          )}

          <Button $variant="primary" $block onClick={vm.goToBurnout}>
            Р С™ Р С—РЎР‚Р С•Р С–РЎР‚Р ВµР Р†РЎС“ РІвЂ вЂ™
          </Button>
        </VsWrap>
      </Screen>
    );
  }

  // РІвЂќР‚РІвЂќР‚ BURNOUT (tyre warming minigame) РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
  if (vm.phase === 'burnout') {
    return (
      <RaceLayout data-racing>
        <Hint>{BURNOUT_HINT}</Hint>

        {vm.selectedCar && (
          <RaceTrack
            car={vm.selectedCar.car}
            cosmetics={vm.selectedCar.cosmetics}
            speed={0}
            distance={0}
            nosActive={false}
            smoke={vm.throttle}
          />
        )}

        <TempWrap>
          <BurnoutGauge
            needle={vm.warmNeedle}
            zone={vm.warmZone}
            timeLeft={vm.warmTime}
            fill={vm.warmFill}
          />
        </TempWrap>

        <Controls>
          <LaunchBtn $variant="outline" onClick={vm.toMenu}>
            Р вЂ™РЎвЂ№РЎвЂ¦Р С•Р Т‘
          </LaunchBtn>
          <GasPedal
            pressed={vm.throttle}
            onPress={() => vm.setThrottle(true)}
            onRelease={() => vm.setThrottle(false)}
          />
          <LaunchBtn $variant="primary" onClick={vm.launch}>
            Р СњР В° РЎРѓРЎвЂљР В°РЎР‚РЎвЂљ РІвЂ вЂ™
          </LaunchBtn>
        </Controls>
      </RaceLayout>
    );
  }

  // РІвЂќР‚РІвЂќР‚ RESULT: engine overheat (DNF) РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
  if (vm.phase === 'result' && (vm.dnf || vm.foul)) {
    return (
      <Screen style={{ textAlign: 'center', paddingTop: 40 }}>
        <ResultIcon>{vm.foul ? '⚠️' : '🔥'}</ResultIcon>
        <Heading $size={22} style={{ marginBottom: 8 }}>
          {vm.foul ? 'ФАЛЬСТАРТ!' : 'ДВИГАТЕЛЬ ПЕРЕГРЕЛСЯ'}
        </Heading>
        <Card style={{ maxWidth: 320, margin: '0 auto 16px' }}>
          <Muted style={{ display: 'block' }}>
            {vm.foul ? 'Ты переключился на передачу до зеленого сигнала светофора. Дождись старта!' : 'Стрелка пробыла в красной зоне слишком долго. Переключайся вовремя!'}
          </Muted>
        </Card>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button $variant="primary" onClick={vm.resetRun}>
            Ещё раз
          </Button>
          <Button $variant="outline" onClick={vm.toMenu}>
            Меню
          </Button>
        </div>
      </Screen>
    );
  }

  // ── RESULT: Free Ride
  if (vm.phase === 'result' && vm.mode === 'free') {
    return (
      <Screen style={{ textAlign: 'center', paddingTop: 30 }}>
        <ResultIcon>РІРЏВ±РїС‘РЏ</ResultIcon>
        <Heading $size={22} style={{ marginBottom: 8 }}>
          Р В¤Р ВР СњР ВР РЃ
        </Heading>
        <Card style={{ maxWidth: 320, margin: '0 auto 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Muted>Р вЂ™РЎР‚Р ВµР СРЎРЏ Р В·Р В°Р ВµР В·Р Т‘Р В°</Muted>
            <strong>{vm.raceTime.toFixed(3)}РЎРѓ</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Muted>Р СљР В°Р С”РЎРѓР С‘Р СР В°Р В»РЎРЉР Р…Р В°РЎРЏ РЎРѓР С”Р С•РЎР‚Р С•РЎРѓРЎвЂљРЎРЉ</Muted>
            <strong>{Math.round(vm.maxSpeedKmh)} Р С”Р С/РЎвЂЎ</strong>
          </div>
        </Card>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button $variant="primary" onClick={() => vm.startFree()}>
            Р вЂўРЎвЂ°РЎвЂ РЎР‚Р В°Р В·
          </Button>
          <Button $variant="outline" onClick={vm.toMenu}>
            Р СљР ВµР Р…РЎР‹
          </Button>
        </div>
      </Screen>
    );
  }

  // РІвЂќР‚РІвЂќР‚ RESULT: clan war РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
  if (vm.phase === 'result' && vm.mode === 'war') {
    const w = vm.warOutcome;
    const isWin = w ? w.won : (vm.opponent?.targetTime != null && vm.raceTime < vm.opponent.targetTime);
    return (
      <Screen style={{ textAlign: 'center', paddingTop: 30 }}>
        <ResultIcon>{isWin ? 'РІС™вЂќРїС‘РЏСЂСџРЏвЂ ' : 'РІС™вЂќРїС‘РЏСЂСџВСћ'}</ResultIcon>
        <Heading $size={22} style={{ marginBottom: 8 }}>
          {isWin ? 'Р С›Р В§Р С™Р С› Р С™Р вЂєР С’Р СњР Р€!' : 'Р СџР В Р ВР вЂ”Р В Р С’Р С™ Р вЂР В«Р РЋР СћР В Р вЂўР вЂў'}
        </Heading>
        <Card style={{ maxWidth: 320, margin: '0 auto 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Muted>Р СћР Р†Р С•РЎвЂ Р Р†РЎР‚Р ВµР СРЎРЏ</Muted>
            <strong>{(w ? w.playerTime : vm.raceTime).toFixed(3)}РЎРѓ</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Muted>Р СџРЎР‚Р С‘Р В·РЎР‚Р В°Р С” ({vm.opponent?.name})</Muted>
            <strong>{(w ? w.ghostTime : vm.opponent?.targetTime)?.toFixed(3)}РЎРѓ</strong>
          </div>
          {w && (
            <div style={{ marginTop: 12, borderTop: '1px solid #2a3050', paddingTop: 8 }}>
              <Muted>Р РЋРЎвЂЎРЎвЂРЎвЂљ Р Р†Р С•Р в„–Р Р…РЎвЂ№</Muted>
              <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
                <span style={{ color: '#2ed573' }}>{w.scoreOurs}</span>
                {' : '}
                <span style={{ color: '#ff4757' }}>{w.scoreTheirs}</span>
              </div>
            </div>
          )}
          {w && w.won && <div style={{ marginTop: 8, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>+75 <img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} /></div>}
          {vm.error && <div style={{ color: '#ff4757', marginTop: 8 }}>{vm.error}</div>}
        </Card>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button $variant="primary" onClick={() => useGameStore.getState().setScreen('clan')}>
            Р С™ Р С”Р В»Р В°Р Р…РЎС“
          </Button>
          <Button $variant="outline" onClick={vm.toMenu}>
            Р СљР ВµР Р…РЎР‹
          </Button>
        </div>
      </Screen>
    );
  }

  // РІвЂќР‚РІвЂќР‚ RESULT: PvE РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
  if (vm.phase === 'result') {
    const r = vm.result;
    const isWin = r ? r.playerWon : (vm.opponent?.targetTime != null && vm.raceTime < vm.opponent.targetTime);
    return (
      <Screen style={{ textAlign: 'center', paddingTop: 30 }}>
        <ResultIcon>{isWin ? 'СЂСџРЏвЂ ' : 'СЂСџВСћ'}</ResultIcon>
        <Heading $size={22} style={{ marginBottom: 8 }}>
          {isWin ? 'Р СџР С›Р вЂР вЂўР вЂќР С’!' : 'Р СџР В Р С›Р ВР вЂњР В Р В«Р РЃ'}
        </Heading>
        <Card style={{ maxWidth: 320, margin: '0 auto 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Muted>Р СћР Р†Р С•РЎвЂ Р Р†РЎР‚Р ВµР СРЎРЏ</Muted>
            <strong>{vm.raceTime.toFixed(3)}РЎРѓ</strong>
          </div>
          {(r?.aiTime != null || vm.opponent?.targetTime != null) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Muted>Р СџРЎР‚Р С•РЎвЂљР С‘Р Р†Р Р…Р С‘Р С”</Muted>
              <strong>{(r?.aiTime ?? vm.opponent?.targetTime)?.toFixed(3)}РЎРѓ</strong>
            </div>
          )}
          {!!r && r.stars > 0 && (
            <div style={{ marginTop: 8 }}>
              <Stars style={{ fontSize: 20 }}>
                {'РІВвЂ¦'.repeat(r.stars)}
                {'РІВвЂ '.repeat(3 - r.stars)}
              </Stars>
            </div>
          )}
          <div style={{ marginTop: 12, borderTop: '1px solid #2a3050', paddingTop: 8 }}>
            <Muted>Р СџР ВµРЎР‚Р ВµР С”Р В»РЎР‹РЎвЂЎР ВµР Р…Р С‘РЎРЏ:</Muted>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' }}>
              {vm.shifts.map((s, i) => (
                <ShiftPill key={i} $q={s}>
                  {s === 'perfect' ? 'P' : s === 'good' ? 'G' : 'M'}
                </ShiftPill>
              ))}
            </div>
          </div>
          {r?.rewards && (
            <div style={{ marginTop: 8, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              +{r.rewards.coins} <img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} /> +{r.rewards.xp} XP
            </div>
          )}
          {vm.error && <div style={{ color: '#ff4757', marginTop: 8 }}>{vm.error}</div>}
        </Card>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Button $variant="primary" onClick={() => vm.startRace()}>
            Р вЂўРЎвЂ°РЎвЂ РЎР‚Р В°Р В·
          </Button>
          <Button $variant="outline" onClick={vm.toMenu}>
            Р СљР ВµР Р…РЎР‹
          </Button>
        </div>
      </Screen>
    );
  }

  // РІвЂќР‚РІвЂќР‚ RACING & STAGING (countdown lights) РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚РІвЂќР‚
  const isFree = vm.mode === 'free';
  const staging = vm.phase === 'countdown';
  return (
    <RaceLayout data-racing>
      {isFree ? (
        <TeleBar>
          <Button $variant="outline" $size="sm" onClick={vm.toMenu}>
            Р вЂ™РЎвЂ№РЎвЂ¦Р С•Р Т‘
          </Button>
            <Tele>
              <strong>{Math.floor(vm.distance)}{vm.distanceMeters === Infinity ? '' : ` / ${vm.distanceMeters}`}</strong>
              <span>РїС—Р…РїС—Р…РїС—Р…РїС—Р…РїС—Р…</span>
            </Tele>
          <Tele>
            <strong>{Math.round(vm.maxSpeedKmh)}</strong>
            <span>Р СР В°Р С”РЎРѓ Р С”Р С/РЎвЂЎ</span>
          </Tele>
          <Tele>
            <strong>{vm.time100 != null ? vm.time100.toFixed(2) : 'РІР‚вЂќ'}</strong>
            <span>0РІР‚вЂњ100</span>
          </Tele>
          <Tele>
            <strong>{vm.time200 != null ? vm.time200.toFixed(2) : 'РІР‚вЂќ'}</strong>
            <span>0РІР‚вЂњ200</span>
          </Tele>
          <Button $variant="outline" $size="sm" onClick={vm.resetRun}>
            РІвЂ В» Р СњР В° РЎРѓРЎвЂљР В°РЎР‚РЎвЂљ
          </Button>
        </TeleBar>
      ) : (
        <RaceHud
          raceTime={vm.raceTime}
          gear={vm.gear}
          maxGears={vm.maxGears}
          distance={vm.distance}
          total={vm.distanceMeters}
        />
      )}

      {vm.selectedCar && (
        <TrackWrap>
          <RaceTrack
            car={vm.selectedCar.car}
            cosmetics={vm.selectedCar.cosmetics}
            speed={vm.speed}
            distance={vm.distance}
            totalDistance={vm.distanceMeters}
            nosActive={vm.nosActive}
            smoke={vm.wheelspin}
            opponentCar={vm.opponent?.car}
            opponentCosmetics={vm.opponent?.cosmetics}
            opponentGap={vm.opponentDistance - vm.distance}
          />
          {(staging || vm.lightsOut) && <StartLights lit={vm.lights} out={vm.lightsOut} />}
        </TrackWrap>
      )}

      {vm.redTime > 0.05 && (
        <HeatWrap>
          <span style={{ color: '#ff4757' }}>СЂСџРЉРЋ Р СџР вЂўР В Р вЂўР вЂњР В Р вЂўР вЂ™</span>
          <HeatTrack>
            <HeatFill $pct={(vm.redTime / OVERHEAT_LIMIT) * 100} />
          </HeatTrack>
        </HeatWrap>
      )}

      {staging && (
        <Hint>СЂСџС™В¦ Р вЂњР В°Р В·РЎС“Р в„– Р Р† Р В·Р ВµР В»РЎвЂР Р…РЎС“РЎР‹ Р В·Р С•Р Р…РЎС“ РЎвЂљР В°РЎвЂ¦Р С•Р СР ВµРЎвЂљРЎР‚Р В° Р С‘ Р Т‘Р ВµРЎР‚Р В¶Р С‘ Р Т‘Р С• Р СР С•Р СР ВµР Р…РЎвЂљР В°, Р С”Р С•Р С–Р Т‘Р В° Р С•Р С–Р Р…Р С‘ Р С—Р С•Р С–Р В°РЎРѓР Р…РЎС“РЎвЂљ!</Hint>
      )}

      <Gauges>
        <Tachometer
          rpm={vm.rpm}
          gear={vm.gear}
          zones={staging ? { perfect: vm.launchZone, good: vm.launchZone } : vm.shiftZones}
          size={140}
        />
        <Column $align="center" $gap={6}>
          <ShiftLight
            perfect={staging ? vm.inLaunchZone : vm.inPerfect}
            good={staging ? false : vm.inGood}
            over={staging ? false : vm.overRev}
          />
          {vm.nosInstalled && <NosIndicator charge={vm.nosCharge} active={vm.nosActive} />}
        </Column>
        <Speedometer speed={vm.speed} size={140} />
      </Gauges>

      <Controls>
        <Paddle side="left" disabled={vm.gear <= 1} onShift={vm.shiftDown} />
        <PedalCluster>
          <BrakePedal
            pressed={false}
            onPress={() => vm.setThrottle(false)}
            onRelease={() => {}}
          />
          <GasPedal
            pressed={vm.throttle}
            onPress={() => vm.setThrottle(true)}
            onRelease={() => vm.setThrottle(false)}
          />
        </PedalCluster>
        <Paddle side="right" disabled={vm.gear >= vm.maxGears} onShift={vm.shiftUp} />
      </Controls>

      <div style={{ padding: '0 4px 8px' }}>
        {vm.nosInstalled ? (
          <NosButton
            $ready={vm.nosCharge >= 25 && !vm.nosActive}
            onClick={vm.activateNos}
            disabled={vm.nosCharge < 25 || vm.nosActive}
          >
            РІС™РЋ NOS {vm.nosActive ? 'ACTIVE' : ''}
          </NosButton>
        ) : (
          <NosButton $ready={false} disabled style={{ fontSize: 12 }}>
            NOS Р Р…Р Вµ РЎС“РЎРѓРЎвЂљР В°Р Р…Р С•Р Р†Р В»Р ВµР Р… РІР‚вЂќ Р С”РЎС“Р С—Р С‘ Р Р† Р С–Р В°РЎР‚Р В°Р В¶Р Вµ
          </NosButton>
        )}
      </div>
    </RaceLayout>
  );
}



