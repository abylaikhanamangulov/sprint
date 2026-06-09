import styled from 'styled-components';
import { Card, Row, Muted, Button } from 'src/views/ui';
import { CarSprite } from 'src/views/components/CarSprite';
import type { PaintType, WheelStyle, SpoilerStyle, IntakeStyle } from 'src/models/types';

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

interface Props {
  vm: ReturnType<typeof import('../GarageViewModel').useGarageViewModel>;
  entry: any;
}

export function GarageCosmetics({ vm, entry }: Props) {
  return (
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
  );
}
