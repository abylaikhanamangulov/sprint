import { Column, Card, Row, Button, EmptyState, Muted } from 'src/views/ui';

interface Props {
  vm: ReturnType<typeof import('../ClanViewModel').useClanViewModel>;
  clan: any;
}

export function ClanWars({ vm, clan }: Props) {
  return (
    <Column $gap={8}>
      {vm.warState && vm.warState.warId > 0 && vm.warState.ghost && (
        <Card style={{ border: '1px solid #9b59b6' }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>⚔️ Заезд войны</div>
          <Muted $size={12} style={{ display: 'block', marginBottom: 8 }}>
            Призрак: <strong>{vm.warState.ghost.name}</strong> на {vm.warState.ghost.carName} —
            цель ¼ мили за <strong>{vm.warState.ghost.time.toFixed(3)}с</strong>. Обгони его время и
            принеси клану очко.
          </Muted>
          <Button $variant="primary" $size="sm" $block onClick={vm.raceWarGhost}>
            Гонять за клан
          </Button>
        </Card>
      )}
      {clan.wars.map((war: any) => {
        const opponent = war.clanA === clan.id ? war.clanB : war.clanA;
        const ourScore = war.clanA === clan.id ? war.scoreA : war.scoreB;
        const theirScore = war.clanA === clan.id ? war.scoreB : war.scoreA;
        return (
          <Card key={war.id}>
            <Row $justify="space-between">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#2ed573' }}>{ourScore}</div>
                <Muted $size={11}>Мы</Muted>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: war.status === 'active' ? '#2ed573' : '#8890a8',
                }}
              >
                {war.status === 'active' ? 'ИДЁТ' : 'ЗАВЕРШЕНА'}
              </span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#ff4757' }}>{theirScore}</div>
                <Muted $size={11}>Клан #{opponent}</Muted>
              </div>
            </Row>
          </Card>
        );
      })}
      {clan.wars.length === 0 && <EmptyState>Нет текущих войн</EmptyState>}
    </Column>
  );
}
