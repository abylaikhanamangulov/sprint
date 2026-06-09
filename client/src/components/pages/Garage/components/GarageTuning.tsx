import { Card, Row, Range, Button } from 'src/views/ui';
import type { NosDuration } from 'src/models/types';

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

interface Props {
  vm: ReturnType<typeof import('../GarageViewModel').useGarageViewModel>;
}

export function GarageTuning({ vm }: Props) {
  if (!vm.tuning) return null;

  return (
    <Card>
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Настройка</h3>
      {TUNING_SLIDERS.map((s) => (
        <div key={s.key} style={{ marginBottom: 16 }}>
          <Row $justify="space-between" style={{ fontSize: 13, marginBottom: 8 }}>
            <span>{s.label}</span>
            <strong style={{ color: '#4e7cff' }}>{vm.tuning?.[s.key as keyof typeof vm.tuning]}</strong>
          </Row>
          <Range
            min={s.min}
            max={s.max}
            step={s.step}
            value={(vm.tuning?.[s.key as keyof typeof vm.tuning] as number) ?? s.min}
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
  );
}
