import styled from 'styled-components';
import { useNotificationsViewModel } from 'src/viewmodels/useNotificationsViewModel';
import type { NotificationType } from 'src/models/types';
import { Screen, Card, Button, Row, Column, Heading, Muted, EmptyState, Loader } from 'src/views/ui';
import { MainHeader } from 'src/components/ui/MainHeader/MainHeader';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const NotifCard = styled(Card)<{ $read: boolean }>`
  padding: 12px;
  cursor: pointer;
  border-left: 3px solid ${({ $read, theme }) => ($read ? theme.colors.border : theme.colors.accent)};
  opacity: ${({ $read }) => ($read ? 0.7 : 1)};
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  flex: 0 0 auto;
`;

const TYPE_ICONS: Record<NotificationType, string> = {
  clan_war: '⚔️',
  daily_reward: '🎁',
  tournament: '🏆',
  challenge: '🏁',
  upgrade: '🔧',
  nft_drop: '💎',
  clan_invite: '🛡️',
};

export function NotificationsView() {
  const vm = useNotificationsViewModel();

  if (vm.loading) {
    return (
      <Loader />
    );
  }

  return (
    <Screen>
      <MainHeader title="Уведомления" showClose={true} onClose={vm.close}>
        <Button $variant="outline" $size="sm" onClick={vm.markAllRead}>
          Пометить все прочитанными
        </Button>
      </MainHeader>

      {vm.notifications.length === 0 && <EmptyState>Нет уведомлений</EmptyState>}

      <Column $gap={6}>
        {vm.notifications.map((n) => (
          <NotifCard key={n.id} $read={n.read} onClick={() => vm.markRead(n.id)}>
            <Row $gap={8} $align="flex-start">
              <span style={{ fontSize: 20 }}>{TYPE_ICONS[n.type] || '📩'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</div>
                <Muted $size={11}>{n.message}</Muted>
                <Muted $size={11} style={{ display: 'block', marginTop: 6 }}>
                  {new Date(n.createdAt).toLocaleString('ru-RU')}
                </Muted>
              </div>
              {!n.read && <Dot />}
            </Row>
          </NotifCard>
        ))}
      </Column>
    </Screen>
  );
}
