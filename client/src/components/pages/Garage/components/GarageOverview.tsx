import { Card, Row, ProgressBar, ProgressFill } from 'src/views/ui';
import type { CarStats } from 'src/models/types';

const STAT_LABELS: Record<keyof CarStats, string> = {
  speed: 'Скорость',
  acceleration: 'Разгон',
  handling: 'Управление',
  nosPower: 'NOS',
  weight: 'Вес',
};

interface Props {
  entry: any; // Using any or explicit type from view model
}

export function GarageOverview({ entry }: Props) {
  return (
    <Card>
      <h3 style={{ fontSize: 16, marginBottom: 12 }}>{entry.car.name}</h3>
      {(Object.entries(entry.currentStats) as [keyof CarStats, number][]).map(([key, value]) => {
        const maxVal = key === 'weight' ? 2000 : 400;
        const pct = key === 'weight' ? (1 - value / maxVal) * 100 : (value / maxVal) * 100;
        return (
          <div key={key} style={{ marginBottom: 8 }}>
            <Row $justify="space-between" style={{ fontSize: 13, marginBottom: 2 }}>
              <span>{STAT_LABELS[key]}</span>
              <strong>{Math.round(value)}</strong>
            </Row>
            <ProgressBar>
              <ProgressFill $pct={pct} $bg={key === 'weight' ? '#ffa502' : '#4e7cff'} />
            </ProgressBar>
          </div>
        );
      })}
    </Card>
  );
}
