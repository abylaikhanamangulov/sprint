import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useHubViewModel } from 'src/components/pages/Hub/HubViewModel';
import { Screen, Card, Button, Grid, ClassBadge } from 'src/views/ui';
import { CarSprite } from 'src/views/components/CarSprite';
import { GlassModal } from 'src/components/ui/GlassModal/GlassModal';
import { RewardsModal } from '../Rewards/RewardsModal';

const Banner = styled(Card)<{ $variant: 'reward' | 'claimed' }>`
  margin-bottom: 16px;
  text-align: center;
  background: ${({ $variant }) =>
    $variant === 'reward'
      ? 'linear-gradient(135deg, #1a1a3e, #2d1b69)'
      : 'linear-gradient(135deg, #0d3320, #1a4a30)'};
`;

const CarBox = styled.div`
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Tile = styled(Card)`
  text-align: center;
  cursor: pointer;
`;

const TileIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const TileLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const TileSub = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';
import coinIcon from 'src/components/icons/assets/coin.svg';

export function HubView() {
  const vm = useHubViewModel();
  const [showRewardModal, setShowRewardModal] = useState(false);

  useEffect(() => {
    // We can auto-open if needed, but for now user will click a button
  }, []);

  return (
    <Screen>
      <MainHeader title="Главная" />
      <RewardsModal isOpen={showRewardModal} onClose={() => setShowRewardModal(false)} />
      <Banner $variant="reward" onClick={() => setShowRewardModal(true)} style={{ cursor: 'pointer' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🎁</div>
        <h3 style={{ fontSize: 16, marginBottom: 4 }}>Система наград</h3>
        <p style={{ fontSize: 13, color: '#8890a8', marginBottom: 12 }}>
          Ежедневные подарки и события
        </p>
        <Button $variant="primary">
          Открыть
        </Button>
      </Banner>

      {vm.selectedCar && (
        <Card style={{ marginBottom: 16, textAlign: 'center' }}>
          <CarBox>
            <CarSprite car={vm.selectedCar.car} width={220} cosmetics={vm.selectedCar.cosmetics} />
          </CarBox>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>{vm.selectedCar.car.name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <ClassBadge $class={vm.selectedCar.car.class}>
              Класс {vm.selectedCar.car.class}
            </ClassBadge>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#4e7cff' }}>
              PP {vm.selectedCar.currentPP}
            </span>
          </div>
        </Card>
      )}

      <Grid $cols={2}>
        <Tile $clickable onClick={() => vm.go('race')}>
          <TileIcon>🏁</TileIcon>
          <TileLabel>Гонка</TileLabel>
          <TileSub>PvP и PvE</TileSub>
        </Tile>
        <Tile $clickable onClick={() => vm.go('garage')}>
          <TileIcon>🔧</TileIcon>
          <TileLabel>Гараж</TileLabel>
          <TileSub>{vm.carCount} авто</TileSub>
        </Tile>
        <Tile $clickable onClick={() => vm.go('shop')}>
          <TileIcon>🛒</TileIcon>
          <TileLabel>Магазин</TileLabel>
          <TileSub>Тачки и тюнинг</TileSub>
        </Tile>
        <Tile style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <TileIcon style={{ filter: 'grayscale(100%)' }}>🗺️</TileIcon>
          <TileLabel>Кампания</TileLabel>
          <TileSub>В разработке</TileSub>
        </Tile>
      </Grid>
    </Screen>
  );
}
