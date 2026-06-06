import styled from 'styled-components';
import { useProfileViewModel } from '../../viewmodels/useProfileViewModel';
import type { ProfileTab } from '../../viewmodels/useProfileViewModel';
import { Screen, Card, Button, Row, Column, Grid, Heading, Muted, Badge, Loader, EmptyState } from '../ui';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 auto 8px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TAB_LABELS: Record<ProfileTab, string> = {
  stats: 'Стат.',
  achievements: 'Ачивки',
  history: 'История',
};

export function ProfileView() {
  const vm = useProfileViewModel();

  if (!vm.profile || !vm.user) {
    return (
      <Loader />
    );
  }

  const { user, profile } = vm;

  if (vm.showLeaderboard) {
    return (
      <Screen>
        <Header>
          <Heading>Таблица лидеров</Heading>
          <Button $variant="outline" $size="sm" onClick={vm.hideLeaderboard}>
            Назад
          </Button>
        </Header>
        <Column $gap={6}>
          {vm.leaderboard.map((p, i) => (
            <Card key={p.id} style={{ padding: 10 }}>
              <Row $justify="space-between">
                <Row $gap={8}>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 16,
                      width: 28,
                      textAlign: 'center',
                      color: i < 3 ? '#ffd700' : '#8890a8',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.firstName || p.username}</div>
                    <Muted $size={11}>
                      Ур.{p.level} · WR {p.winRate}%
                    </Muted>
                  </div>
                </Row>
                <span style={{ fontWeight: 700, color: '#4e7cff' }}>{p.rankPoints} RP</span>
              </Row>
            </Card>
          ))}
        </Column>
      </Screen>
    );
  }

  const statRows: { label: string; value: string | number }[] = [
    { label: 'Всего гонок', value: user.stats.totalRaces },
    { label: 'Win Rate (PvP)', value: `${vm.winRate}%` },
    {
      label: 'Лучшее время (1/4)',
      value: user.stats.bestTime > 0 ? `${user.stats.bestTime.toFixed(3)}с` : '—',
    },
    { label: 'Perfect переключения', value: user.stats.perfectShifts },
    { label: 'Макс. серия побед', value: user.stats.longestWinStreak },
    { label: 'Серебра заработано', value: user.stats.silverEarned.toLocaleString() },
    { label: 'Rank Points', value: user.rankPoints },
  ];

  return (
    <Screen>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Avatar>{user.firstName.charAt(0)}</Avatar>
        <Heading>{user.firstName}</Heading>
        <Muted>@{user.username}</Muted>
        <Row $justify="center" $gap={12} style={{ marginTop: 8 }}>
          <Badge $bg="#4e7cff">Ур.{user.level}</Badge>
          <Badge $bg="#1c2137" $color="#ffd700">
            {vm.tier?.name || 'Новичок'}
          </Badge>
        </Row>
        {profile.clan && (
          <Muted $size={11} style={{ display: 'block', marginTop: 8 }}>
            🛡️ [{profile.clan.tag || ''}] {profile.clan.name} · {profile.clan.role}
          </Muted>
        )}
      </div>

      <Button $variant="outline" $size="sm" $block style={{ marginBottom: 12 }} onClick={vm.loadLeaderboard}>
        🏅 Таблица лидеров
      </Button>

      <Row $gap={8} style={{ marginBottom: 12 }}>
        {(['stats', 'achievements', 'history'] as ProfileTab[]).map((t) => (
          <Button
            key={t}
            $size="sm"
            $variant={vm.tab === t ? 'primary' : 'outline'}
            onClick={() => vm.setTab(t)}
          >
            {TAB_LABELS[t]}
          </Button>
        ))}
      </Row>

      {vm.tab === 'stats' && (
        <Card>
          {statRows.map((row) => (
            <StatRow key={row.label}>
              <Muted>{row.label}</Muted>
              <strong style={{ fontSize: 13 }}>{row.value}</strong>
            </StatRow>
          ))}
        </Card>
      )}

      {vm.tab === 'achievements' && (
        <Grid $cols={2} $gap={8}>
          {profile.achievements.map((a) => (
            <Card key={a.id} style={{ textAlign: 'center', opacity: a.unlocked ? 1 : 0.4, padding: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{a.unlocked ? '🏅' : '🔒'}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
              <Muted $size={11}>{a.description}</Muted>
              {a.unlocked && (
                <div style={{ fontSize: 11, color: '#2ed573', marginTop: 8 }}>
                  +{a.rewardXp}XP +{a.rewardSilver}🪙
                </div>
              )}
            </Card>
          ))}
        </Grid>
      )}

      {vm.tab === 'history' && (
        <Column $gap={6}>
          {profile.recentRaces.map((r) => {
            const isWinner = r.winnerId === user.id;
            return (
              <Card key={r.id} style={{ padding: 10 }}>
                <Row $justify="space-between">
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 12, color: isWinner ? '#2ed573' : '#ff4757' }}>
                      {isWinner ? 'ПОБЕДА' : 'ПРОИГРЫШ'}
                    </span>
                    <Muted $size={11} style={{ marginLeft: 8 }}>
                      {r.type}
                    </Muted>
                  </div>
                  <Muted $size={11}>{r.player1.time.toFixed(3)}с</Muted>
                </Row>
              </Card>
            );
          })}
          {profile.recentRaces.length === 0 && <EmptyState>Нет истории гонок</EmptyState>}
        </Column>
      )}
    </Screen>
  );
}
