import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useHubViewModel } from 'src/viewmodels/useHubViewModel';
import { Screen, Card, Button, Grid, ClassBadge } from 'src/views/ui';
import { CarSprite } from 'src/views/components/CarSprite';
import { GlassModal } from 'src/components/ui/GlassModal/GlassModal';

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
    if (vm.dailyResult) {
      setShowRewardModal(true);
    }
  }, [vm.dailyResult]);

  return (
    <Screen>
      <MainHeader title="Главная" />
      <GlassModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        icon={<div style={{ fontSize: '72px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🎁</div>}
        title="Ежедневная награда"
        description={
          vm.dailyResult ? (
            <>
              Вы зашли в игру <strong>{vm.dailyResult.streak} дней подряд</strong>!<br/><br/>
              Вы получили:<br/>
              <span style={{ color: '#e8eaf0', fontSize: '18px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: 6 }}>{vm.dailyResult.reward.coins} <img src={coinIcon} alt="coin" style={{ width: 20, height: 20 }} /></span>
            </>
          ) : null
        }
        actionText="Круто!"
      />

      {vm.dailyAvailable && !vm.dailyResult && (
        <Banner $variant="reward">
          <div style={{ fontSize: 24, marginBottom: 8 }}>🎁</div>
          <h3 style={{ fontSize: 16, marginBottom: 4 }}>Ежедневная награда</h3>
          <p style={{ fontSize: 13, color: '#8890a8', marginBottom: 12 }}>
            День {vm.dailyStreak + 1} из 7
          </p>
          <Button $variant="primary" onClick={vm.claimDaily} disabled={vm.claiming}>
            {vm.claiming ? '...' : 'Забрать'}
          </Button>
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
