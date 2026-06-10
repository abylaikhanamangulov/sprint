import styled from 'styled-components';
import { useGarageViewModel } from './GarageViewModel';
import type { GarageTab } from './GarageViewModel';
import { Screen, Button, Row, ScrollRow, Muted } from 'src/views/ui';
import { CarCard as OldCarCard } from 'src/views/components/CarCard';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';

import { GarageDealership } from './components/GarageDealership';
import { GarageOverview } from './components/GarageOverview';
import { GarageUpgrades } from './components/GarageUpgrades';
import { GarageTuning } from './components/GarageTuning';
import { GarageCosmetics } from './components/GarageCosmetics';
import { GarageInventory } from './components/GarageInventory';

const TabButton = styled(Button).attrs({ $size: 'sm' as const })``;

const TAB_LABELS: Record<GarageTab, string> = {
  overview: 'Обзор',
  upgrades: 'Апгрейды',
  tuning: 'Тюнинг',
  look: 'Внешка',
  inventory: 'Инвентарь',
};

export function GarageView() {
  const vm = useGarageViewModel();

  if (vm.showDealership) {
    return <GarageDealership vm={vm} />;
  }

  const entry = vm.selectedEntry;

  return (
    <Screen>
      <MainHeader title="Гараж" />
      <div style={{ marginBottom: 12 }}>
        <Button $variant="primary" $size="sm" onClick={vm.openDealership}>
          + Купить
        </Button>
      </div>

      <ScrollRow>
        {vm.myCars.map((c) => (
          <OldCarCard
            key={c.carId}
            car={c.car}
            cosmetics={c.cosmetics}
            currentPP={c.currentPP}
            isSelected={c.carId === entry?.carId}
            onClick={() => vm.selectEntry(c.carId)}
          />
        ))}
      </ScrollRow>

      {entry && (
        <>
          <Row $gap={6} style={{ marginBottom: 16, flexWrap: 'wrap' }}>
            {(['overview', 'upgrades', 'tuning', 'look', 'inventory'] as GarageTab[]).map((t) => (
              <TabButton
                key={t}
                $variant={vm.tab === t ? 'primary' : 'outline'}
                onClick={() => vm.setTab(t)}
              >
                {TAB_LABELS[t]}
              </TabButton>
            ))}
          </Row>

          {vm.tab === 'overview' && <GarageOverview entry={entry} />}
          {vm.tab === 'upgrades' && <GarageUpgrades vm={vm} />}
          {vm.tab === 'tuning' && <GarageTuning vm={vm} />}
          {vm.tab === 'look' && <GarageCosmetics vm={vm} entry={entry} />}
          {vm.tab === 'inventory' && <GarageInventory vm={vm} />}
        </>
      )}
      {vm.error && <Muted style={{ color: '#ff4757' }}>{vm.error}</Muted>}
    </Screen>
  );
}
