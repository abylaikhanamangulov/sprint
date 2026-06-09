import { Screen, Card, Button, Row, Column, Muted } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';

interface Props {
  vm: ReturnType<typeof import('../ClanViewModel').useClanViewModel>;
}

export function ClanList({ vm }: Props) {
  return (
    <Screen>
      <MainHeader title="Кланы" />
      <div style={{ marginBottom: 12 }}>
        <Button $variant="primary" $size="sm" onClick={() => vm.setCreating(true)}>
          + Создать
        </Button>
      </div>
      <Column $gap={8}>
        {vm.clanList.map((c) => (
          <Card key={c.id}>
            <Row $justify="space-between">
              <div>
                <span style={{ fontWeight: 700 }}>
                  [{c.tag}] {c.name}
                </span>
                <Muted $size={11} style={{ display: 'block', marginTop: 4 }}>
                  Ур.{c.level} · {c.memberCount} участников
                </Muted>
              </div>
              <Button $variant="primary" $size="sm" onClick={() => vm.joinClan(c.id)}>
                Вступить
              </Button>
            </Row>
          </Card>
        ))}
      </Column>
    </Screen>
  );
}
