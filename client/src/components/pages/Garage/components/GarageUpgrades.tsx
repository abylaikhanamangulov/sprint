import { Column, Card, Row, Muted, ProgressBar, ProgressFill, Button, Badge } from 'src/views/ui';
import coinIcon from 'src/components/icons/assets/coin.svg';

interface Props {
  vm: ReturnType<typeof import('../GarageViewModel').useGarageViewModel>;
}

export function GarageUpgrades({ vm }: Props) {
  return (
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {cat.currency === 'stars' ? '⭐' : <img src={coinIcon} alt="coin" style={{ width: 14, height: 14 }} />} {cat.nextCost}
                </span>
              </Button>
            ) : (
              <Badge $bg="#2ed573">MAX</Badge>
            )}
          </Row>
        </Card>
      ))}
    </Column>
  );
}
