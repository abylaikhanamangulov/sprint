import styled from 'styled-components';
import { useState, useMemo } from 'react';
import { useGarageViewModel } from '../../viewmodels/useGarageViewModel';
import type { GarageTab } from '../../viewmodels/useGarageViewModel';
import type {
  CarStats,
  NosDuration,
  PaintType,
  WheelStyle,
  SpoilerStyle,
  IntakeStyle,
} from '../../models/types';
import {
  Screen,
  Card,
  Button,
  Row,
  Column,
  Grid,
  ScrollRow,
  Heading,
  Badge,
  ProgressBar,
  ProgressFill,
  EmptyState,
  Muted,
  Range,
} from '../ui';
import { CarCard as OldCarCard } from '../components/CarCard';
import { CarCard as UiCarCard } from '../../components/ui/CarCard/CarCard';
import { CarSprite } from '../components/CarSprite';
import { GlassTabs } from '../../components/ui/GlassTabs/GlassTabs';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const TabButton = styled(Button).attrs({ $size: 'sm' as const })``;

const STAT_LABELS: Record<keyof CarStats, string> = {
  speed: 'Скорость',
  acceleration: 'Разгон',
  handling: 'Управление',
  nosPower: 'NOS',
  weight: 'Вес',
};

const TAB_LABELS: Record<GarageTab, string> = {
  overview: 'Обзор',
  upgrades: 'Апгрейды',
  tuning: 'Тюнинг',
  look: 'Внешка',
};

const PAINTS: { id: PaintType; label: string }[] = [
  { id: 'gloss', label: 'Глянец' },
  { id: 'metallic', label: 'Металлик' },
  { id: 'matte', label: 'Мат' },
  { id: 'chrome', label: 'Хром' },
];
const WHEELS: { id: WheelStyle; label: string }[] = [
  { id: 'stock', label: 'Сток' },
  { id: 'sport', label: 'Спорт' },
  { id: 'deepdish', label: 'Дип-диш' },
];
const SPOILERS: { id: SpoilerStyle; label: string }[] = [
  { id: 'none', label: 'Нет' },
  { id: 'lip', label: 'Лип' },
  { id: 'gt', label: 'GT-крыло' },
];
const INTAKES: { id: IntakeStyle; label: string }[] = [
  { id: 'none', label: 'Нет' },
  { id: 'hood', label: 'Капотный' },
];
const COLORS = ['', '#e23b3b', '#2d8cf0', '#2ed573', '#ffd700', '#9b59b6', '#ff8c00', '#e8eaf0', '#15171f'];

const Swatch = styled.button<{ $c: string; $on: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${({ $on }) => ($on ? '#fff' : '#2a3050')};
  background: ${({ $c }) => $c || 'repeating-conic-gradient(#888 0 25%, #555 0 50%)'};
  background-size: ${({ $c }) => ($c ? 'auto' : '10px 10px')};
`;

const PreviewBox = styled.div`
  background: ${({ theme }) => theme.colors.bgPrimary};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-bottom: 12px;
`;

const TUNING_SLIDERS = [
  { key: 'finalDrive', label: 'Главная передача', min: 2.5, max: 4.5, step: 0.1 },
  { key: 'tirePressure', label: 'Давление шин (PSI)', min: 26, max: 36, step: 1 },
  { key: 'suspensionStiffness', label: 'Жёсткость подвески', min: 0, max: 100, step: 5 },
  { key: 'turboBoost', label: 'Давление турбины', min: 0, max: 100, step: 5 },
] as const;

const NOS_DURATIONS: { value: NosDuration; label: string }[] = [
  { value: 'short', label: 'Короткий' },
  { value: 'medium', label: 'Средний' },
  { value: 'long', label: 'Длинный' },
];

export function GarageView() {
  const vm = useGarageViewModel();
  const [filterClass, setFilterClass] = useState<string>('all');

  const filteredCars = useMemo(() => {
    if (filterClass === 'all') return vm.available;
    return vm.available.filter(c => c.class === filterClass);
  }, [vm.available, filterClass]);

  if (vm.showDealership) {
    return (
      <Screen>
        <Header>
          <Heading>Автосалон</Heading>
          <Button $variant="outline" $size="sm" onClick={vm.closeDealership}>
            Назад
          </Button>
        </Header>
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
            const priceNode = car.priceSilver != null ? (
              <span style={{ color: '#e8eaf0' }}>{car.priceSilver.toLocaleString()} 🪙</span>
            ) : car.priceGold != null ? (
              <span style={{ color: '#ffd700' }}>{car.priceGold.toLocaleString()} 💎</span>
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

  const entry = vm.selectedEntry;

  return (
    <Screen>
      <Header>
        <Heading>Гараж</Heading>
        <Button $variant="primary" $size="sm" onClick={vm.openDealership}>
          + Купить
        </Button>
      </Header>

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
            {(['overview', 'upgrades', 'tuning', 'look'] as GarageTab[]).map((t) => (
              <TabButton
                key={t}
                $variant={vm.tab === t ? 'primary' : 'outline'}
                onClick={() => vm.setTab(t)}
              >
                {TAB_LABELS[t]}
              </TabButton>
            ))}
          </Row>

          {vm.tab === 'overview' && (
            <Card>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>{entry.car.name}</h3>
              {(Object.entries(entry.currentStats) as [keyof CarStats, number][]).map(
                ([key, value]) => {
                  const maxVal = key === 'weight' ? 2000 : 400;
                  const pct =
                    key === 'weight' ? (1 - value / maxVal) * 100 : (value / maxVal) * 100;
                  return (
                    <div key={key} style={{ marginBottom: 8 }}>
                      <Row $justify="space-between" style={{ fontSize: 13, marginBottom: 2 }}>
                        <span>{STAT_LABELS[key]}</span>
                        <strong>{Math.round(value)}</strong>
                      </Row>
                      <ProgressBar>
                        <ProgressFill
                          $pct={pct}
                          $bg={key === 'weight' ? '#ffa502' : '#4e7cff'}
                        />
                      </ProgressBar>
                    </div>
                  );
                }
              )}
            </Card>
          )}

          {vm.tab === 'upgrades' && (
            <Column $gap={8}>
              {vm.upgrades.map((cat) => (
                <Card key={cat.id}>
                  <Row $justify="space-between">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</div>
                      <Muted $size={11}>
                        Стадия {cat.currentStage}/{cat.maxStage}
                      </Muted>
                      <ProgressBar style={{ width: 100, marginTop: 8 }}>
                        <ProgressFill $pct={(cat.currentStage / cat.maxStage) * 100} $bg="#2ed573" />
                      </ProgressBar>
                    </div>
                    {cat.canUpgrade ? (
                      <Button $variant="primary" $size="sm" onClick={() => vm.doUpgrade(cat.id)}>
                        {cat.currency === 'gold' ? '💎' : '🪙'} {cat.nextCost}
                      </Button>
                    ) : (
                      <Badge $bg="#2ed573">MAX</Badge>
                    )}
                  </Row>
                </Card>
              ))}
            </Column>
          )}

          {vm.tab === 'tuning' && vm.tuning && (
            <Card>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Настройка</h3>
              {TUNING_SLIDERS.map((s) => (
                <div key={s.key} style={{ marginBottom: 16 }}>
                  <Row $justify="space-between" style={{ fontSize: 13, marginBottom: 8 }}>
                    <span>{s.label}</span>
                    <strong style={{ color: '#4e7cff' }}>{vm.tuning?.[s.key]}</strong>
                  </Row>
                  <Range
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={vm.tuning?.[s.key] ?? s.min}
                    onChange={(e) => vm.setTuningField(s.key, parseFloat(e.target.value))}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, marginBottom: 8 }}>Длительность NOS</div>
                <Row $gap={8}>
                  {NOS_DURATIONS.map((d) => (
                    <Button
                      key={d.value}
                      $size="sm"
                      $variant={vm.tuning?.nosDuration === d.value ? 'primary' : 'outline'}
                      onClick={() => vm.setTuningField('nosDuration', d.value)}
                    >
                      {d.label}
                    </Button>
                  ))}
                </Row>
              </div>
              <Button $variant="primary" $block onClick={vm.saveTuning}>
                Сохранить
              </Button>
            </Card>
          )}

          {vm.tab === 'look' && (
            <Card>
              <PreviewBox>
                <CarSprite car={entry.car} width={220} cosmetics={vm.cosmetics} />
              </PreviewBox>

              <Muted $size={12} style={{ display: 'block', marginBottom: 6 }}>Окрас</Muted>
              <Row $gap={6} style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                {PAINTS.map((p) => (
                  <Button
                    key={p.id}
                    $size="sm"
                    $variant={vm.cosmetics.paintType === p.id ? 'primary' : 'outline'}
                    onClick={() => vm.setCosmeticField('paintType', p.id)}
                  >
                    {p.label}
                  </Button>
                ))}
              </Row>
              <Row $gap={8} style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                {COLORS.map((c) => (
                  <Swatch
                    key={c || 'default'}
                    $c={c}
                    $on={vm.cosmetics.paintColor === c}
                    onClick={() => vm.setCosmeticField('paintColor', c)}
                    title={c || 'По умолчанию'}
                  />
                ))}
              </Row>

              <Muted $size={12} style={{ display: 'block', marginBottom: 6 }}>Диски</Muted>
              <Row $gap={6} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
                {WHEELS.map((wst) => (
                  <Button
                    key={wst.id}
                    $size="sm"
                    $variant={vm.cosmetics.wheels === wst.id ? 'primary' : 'outline'}
                    onClick={() => vm.setCosmeticField('wheels', wst.id)}
                  >
                    {wst.label}
                  </Button>
                ))}
              </Row>

              <Muted $size={12} style={{ display: 'block', marginBottom: 6 }}>Спойлер</Muted>
              <Row $gap={6} style={{ marginBottom: 12, flexWrap: 'wrap' }}>
                {SPOILERS.map((sp) => (
                  <Button
                    key={sp.id}
                    $size="sm"
                    $variant={vm.cosmetics.spoiler === sp.id ? 'primary' : 'outline'}
                    onClick={() => vm.setCosmeticField('spoiler', sp.id)}
                  >
                    {sp.label}
                  </Button>
                ))}
              </Row>

              <Muted $size={12} style={{ display: 'block', marginBottom: 6 }}>Воздухозаборник</Muted>
              <Row $gap={6} style={{ marginBottom: 16, flexWrap: 'wrap' }}>
                {INTAKES.map((it) => (
                  <Button
                    key={it.id}
                    $size="sm"
                    $variant={vm.cosmetics.intake === it.id ? 'primary' : 'outline'}
                    onClick={() => vm.setCosmeticField('intake', it.id)}
                  >
                    {it.label}
                  </Button>
                ))}
              </Row>

              <Button $variant="primary" $block onClick={vm.saveCosmetics}>
                {vm.cosmeticsSaved ? 'Сохранено ✓' : 'Сохранить вид'}
              </Button>
            </Card>
          )}
        </>
      )}
      {vm.error && <Muted style={{ color: '#ff4757' }}>{vm.error}</Muted>}
    </Screen>
  );
}
