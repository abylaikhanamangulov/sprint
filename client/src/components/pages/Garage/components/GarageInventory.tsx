import styled from 'styled-components';
import { Button } from 'src/views/ui';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
`;

const ItemCard = styled.div`
  background: rgba(28, 33, 55, 0.6);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  gap: 8px;
`;

const ItemIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;

  & > div {
    height: 100%;
    background: #2ed573;
    width: 0%;
  }
`;

export function GarageInventory({ vm }: { vm: ReturnType<typeof import('../GarageViewModel').useGarageViewModel> }) {
  if (vm.inventory.length === 0) {
    return <div style={{ textAlign: 'center', padding: 32 }}>Инвентарь пуст</div>;
  }

  const fragments = vm.inventory.filter(i => i.type === 'car_fragment');
  const cards = vm.inventory.filter(i => i.type !== 'car_fragment');

  return (
    <div>
      {fragments.length > 0 && (
        <>
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>Фрагменты машин</h3>
          <Grid>
            {fragments.map(f => {
              const data = f.data as import('src/models/types').CarFragmentData;
              const carId = data.carId;
              const car = vm.available.find(c => c.id === carId) || vm.myCars.find(c => c.carId === carId)?.car;
              const amount = f.amount;
              const isReady = amount >= 6;
              const percent = Math.min((amount / 6) * 100, 100);

              return (
                <ItemCard key={f.id}>
                  <ItemIcon>🚗</ItemIcon>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>{car ? car.name : `Car ${carId}`}</div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>{amount} / 6</div>
                  <ProgressBar>
                    <div style={{ width: `${percent}%`, background: isReady ? '#2ed573' : '#3498db' }} />
                  </ProgressBar>
                  <Button 
                    $variant="primary" 
                    $size="sm" 
                    disabled={!isReady} 
                    onClick={() => vm.craftCar(carId)}
                  >
                    Собрать
                  </Button>
                </ItemCard>
              );
            })}
          </Grid>
        </>
      )}

      {cards.length > 0 && (
        <>
          <h3 style={{ marginTop: 24, marginBottom: 8 }}>Карточки</h3>
          <Grid>
            {cards.map(c => {
              const isUpgrade = c.type === 'upgrade_card';
              const cat = isUpgrade ? (c.data as import('src/models/types').UpgradeCardData).category : '';
              return (
                <ItemCard key={c.id}>
                  <ItemIcon>🃏</ItemIcon>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                    {isUpgrade ? `Карта улучшения (${cat})` : 'ЭБУ карта'}
                  </div>
                  <div style={{ fontSize: 16, color: '#f1c40f' }}>x{c.amount}</div>
                </ItemCard>
              );
            })}
          </Grid>
        </>
      )}
    </div>
  );
}
