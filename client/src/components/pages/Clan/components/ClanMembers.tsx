import { Column, Card, Row, Button, Muted } from 'src/views/ui';
import coinIcon from 'src/components/icons/assets/coin.svg';

const ROLE_LABELS: Record<string, string> = {
  leader: 'Лидер',
  officer: 'Офицер',
  racer: 'Гонщик',
  recruit: 'Новичок',
};

interface Props {
  vm: ReturnType<typeof import('../ClanViewModel').useClanViewModel>;
  clan: any;
}

export function ClanMembers({ vm, clan }: Props) {
  return (
    <>
      <Column $gap={6}>
        {clan.members.map((m: any) => (
          <Card key={m.userId} style={{ padding: 10 }}>
            <Row $justify="space-between">
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  {m.firstName || m.username}
                </span>
                <Muted $size={11} style={{ marginLeft: 6 }}>
                  {ROLE_LABELS[m.role] || m.role}
                </Muted>
              </div>
              <Muted $size={11} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Вклад: {m.contribution} <img src={coinIcon} alt="coin" style={{ width: 12, height: 12 }} />
              </Muted>
            </Row>
          </Card>
        ))}
      </Column>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, marginBottom: 8 }}>Пожертвовать в казну</div>
        <Row $gap={8}>
          {[100, 500, 1000].map((amt) => (
            <Button key={amt} $variant="outline" $size="sm" onClick={() => vm.donate(amt)}>
              {amt} <img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} />
            </Button>
          ))}
        </Row>
      </div>
    </>
  );
}
