import { Button, Card, ProgressBar as UIProgressBar, ProgressFill, Grid as UIGrid, Heading, Muted } from 'src/views/ui';

export function GarageInventory({ vm }: { vm: ReturnType<typeof import('../GarageViewModel').useGarageViewModel> }) {
  if (vm.inventory.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Muted $size={14}>Инвентарь пуст</Muted>
      </div>
    );
  }

  const fragments = vm.inventory.filter(i => i.type === 'car_fragment');
  const cards = vm.inventory.filter(i => i.type !== 'car_fragment');

  return (
    <div style={{ paddingBottom: 24 }}>
      {fragments.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Heading $size={16} style={{ marginBottom: 16 }}>Фрагменты машин</Heading>
          <UIGrid $cols={2} $gap={12}>
            {fragments.map(f => {
              const data = f.data as import('src/models/types').CarFragmentData;
              const carId = data.carId;
              const car = vm.available.find(c => c.id === carId) || vm.myCars.find(c => c.carId === carId)?.car;
              const amount = f.amount;
              const isReady = amount >= 6;
              const percent = Math.min((amount / 6) * 100, 100);

              return (
                <Card key={f.id} style={{ display: 'flex', flexDirection: 'column', padding: 16 }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                      {car ? car.name : `Car ${carId}`}
                    </div>
                    <Muted $size={12}>{amount} из 6 фрагментов</Muted>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <UIProgressBar $height={4}>
                      <ProgressFill $pct={percent} $bg={isReady ? '#cfff04' : '#a1a1aa'} />
                    </UIProgressBar>
                  </div>
                  
                  <Button 
                    $variant={isReady ? 'primary' : 'outline'}
                    $size="sm" 
                    $block
                    disabled={!isReady} 
                    onClick={() => vm.craftCar(carId)}
                  >
                    Собрать
                  </Button>
                </Card>
              );
            })}
          </UIGrid>
        </div>
      )}

      {cards.length > 0 && (
        <div>
          <Heading $size={16} style={{ marginBottom: 16 }}>Карточки улучшений</Heading>
          <UIGrid $cols={2} $gap={12}>
            {cards.map(c => {
              const isUpgrade = c.type === 'upgrade_card';
              const cat = isUpgrade ? (c.data as import('src/models/types').UpgradeCardData).category : '';
              
              return (
                <Card key={c.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa', marginBottom: 8, textAlign: 'center' }}>
                    {isUpgrade ? `Улучшение` : 'ЭБУ'}
                    {isUpgrade && <div style={{ fontSize: 11, marginTop: 2 }}>{cat}</div>}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#cfff04' }}>x{c.amount}</div>
                </Card>
              );
            })}
          </UIGrid>
        </div>
      )}
    </div>
  );
}
