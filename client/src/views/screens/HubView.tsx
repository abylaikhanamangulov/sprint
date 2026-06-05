import styled from 'styled-components';
import { useHubViewModel } from '../../viewmodels/useHubViewModel';
import { Screen, Card, Button, Grid, ClassBadge } from '../ui';
import { CarSprite } from '../components/CarSprite';

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

export function HubView() {
  const vm = useHubViewModel();

  return (
    <Screen>
      {vm.dailyAvailable && !vm.dailyResult && (
        <Banner $variant="reward">
          <div style={{ fontSize: 24, marginBottom: 8 }}>🎁</div>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Ежедневная награда</h3>
          <p style={{ fontSize: 13, color: '#8890a8', marginBottom: 12 }}>
            День {vm.dailyStreak + 1} из 7
          </p>
          <Button $variant="gold" onClick={vm.claimDaily} disabled={vm.claiming}>
            {vm.claiming ? '...' : 'Забрать'}
          </Button>
        </Banner>
      )}

      {vm.dailyResult && (
        <Banner $variant="claimed">
          <div style={{ fontSize: 20, marginBottom: 4 }}>✅ День {vm.dailyResult.streak}</div>
          <div style={{ fontSize: 14 }}>
            +{vm.dailyResult.reward.silver} 🪙
            {vm.dailyResult.reward.gold > 0 && ` +${vm.dailyResult.reward.gold} 💎`}
          </div>
        </Banner>
      )}

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
        <Tile $clickable onClick={() => vm.go('campaign')}>
          <TileIcon>🗺️</TileIcon>
          <TileLabel>Кампания</TileLabel>
          <TileSub>⚡ {vm.energy}/{vm.maxEnergy}</TileSub>
        </Tile>
      </Grid>
    </Screen>
  );
}
