import { useMemo, useState } from 'react';
import { Screen, Grid, EmptyState, Muted } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';
import { GlassTabs } from 'src/components/ui/GlassTabs/GlassTabs';
import { CarCard as UiCarCard } from 'src/components/ui/CarCard/CarCard';
import coinIcon from 'src/components/icons/assets/coin.svg';

interface Props {
  vm: ReturnType<typeof import('../GarageViewModel').useGarageViewModel>;
}

export function GarageDealership({ vm }: Props) {
  const [filterClass, setFilterClass] = useState<string>('all');

  const filteredCars = useMemo(() => {
    if (filterClass === 'all') return vm.available;
    return vm.available.filter((c) => c.class === filterClass);
  }, [vm.available, filterClass]);

  return (
    <Screen>
      <MainHeader title="Автосалон" showClose={true} onClose={vm.closeDealership} />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 120 }}>
        <GlassTabs
          tabs={[
            { id: 'all', label: 'Все' },
            { id: 'D', label: 'Класс D' },
            { id: 'C', label: 'Класс C' },
            { id: 'B', label: 'Класс B' },
            { id: 'A', label: 'Класс A' },
            { id: 'S', label: 'Класс S' },
            { id: 'X', label: 'Класс X' },
          ]}
          activeTab={filterClass}
          onChange={setFilterClass}
        />
        <Grid $cols={2} style={{ marginTop: 16 }}>
          {filteredCars.map((car) => {
            const priceNode = car.priceCoins != null ? (
              <span style={{ color: '#e8eaf0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {car.priceCoins.toLocaleString()} <img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} />
              </span>
            ) : (
              <span style={{ color: '#2ed573' }}>Бесплатно</span>
            );

            return (
              <UiCarCard
                key={car.id}
                imageSrc={car.image || '/mustang.png'}
                name={car.name}
                price={priceNode}
                onClick={() => vm.buyCar(car.id)}
              />
            );
          })}
        </Grid>
        {filteredCars.length === 0 && <EmptyState>Нет машин в этой категории!</EmptyState>}
      </div>
      {vm.error && <Muted style={{ color: '#ff4757' }}>{vm.error}</Muted>}
    </Screen>
  );
}
