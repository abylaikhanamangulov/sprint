import { useEventsViewModel } from 'src/viewmodels/useEventsViewModel';
import { Screen, Card, Button, Row, Column, Heading, Muted, Loader } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';
import coinIcon from 'src/components/icons/assets/coin.svg';

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  active: { text: 'Активен', color: '#2ed573' },
  upcoming: { text: 'Скоро', color: '#ffa502' },
  completed: { text: 'Завершён', color: '#8890a8' },
};

export function EventsView() {
  const vm = useEventsViewModel();

  if (vm.loading) {
    return (
      <Loader />
    );
  }

  return (
    <Screen>
      <MainHeader title="События" />
      <Column $gap={12}>
        {vm.tournaments.map((t) => {
          const status = STATUS_LABELS[t.status] ?? STATUS_LABELS.upcoming;
          const hoursLeft = Math.max(
            0,
            (new Date(t.endsAt).getTime() - Date.now()) / (1000 * 60 * 60)
          );
          return (
            <Card key={t.id}>
              <Row $justify="space-between" style={{ marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: status.color,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: `${status.color}20`,
                  }}
                >
                  {status.text}
                </span>
              </Row>
              <Muted $size={11} style={{ display: 'block', marginBottom: 8, lineHeight: 1.6 }}>
                {t.type === 'bracket' ? `Сетка: ${t.bracketSize} игроков` : 'Заезд на время'}
                {t.classRestriction && ` · Класс ${t.classRestriction}`}
                <br />
                Осталось: {hoursLeft.toFixed(0)}ч · Участников: {t.participants.length}
              </Muted>
              {t.entryFee.amount > 0 && (
                <div style={{ fontSize: 11, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Вход: {t.entryFee.amount} {t.entryFee.currency === 'stars' ? '⭐' : <img src={coinIcon} alt="coin" style={{ width: 12, height: 12 }} />}
                </div>
              )}
              <Row $gap={8} style={{ marginBottom: 8, fontSize: 11, color: '#8890a8', flexWrap: 'wrap' }}>
                {t.prizePool.map((p) => (
                  <span key={p.place} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    #{p.place}: {p.coins}<img src={coinIcon} alt="coin" style={{ width: 12, height: 12 }} />
                  </span>
                ))}
              </Row>
              {t.status !== 'completed' && (
                <Button $variant="primary" $size="sm" $block onClick={() => vm.join(t.id)}>
                  Участвовать
                </Button>
              )}
            </Card>
          );
        })}
      </Column>
      {vm.error && <Muted style={{ color: '#ff4757' }}>{vm.error}</Muted>}
    </Screen>
  );
}
