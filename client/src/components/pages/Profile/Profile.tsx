import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'src/routes/paths';

import { Screen, Card, Button, Row, Column, Grid, Heading, Muted, Loader } from 'src/views/ui';

import settingsIcon from 'src/components/icons/assets/settings.svg';
import bellIcon from 'src/components/icons/assets/bell.svg';
import addCircleIcon from 'src/components/icons/assets/add-circle.svg';
import verifiedCheckIcon from 'src/components/icons/assets/verefied-check.svg';
import calendarIcon from 'src/components/icons/assets/calendar.svg';
import cupIcon from 'src/components/icons/assets/cup.svg';

import { useProfileViewModel } from './ProfileViewModel';
import { DailyBonusWidget } from './components/DailyBonusWidget';
import { TasksModal } from './components/TasksModal';

import {
  MaskIcon,
  ProfileTopBar,
  TopLeft,
  TopRight,
  BalanceBadge,
  IconButton,
  BellBadge,
  Header,
  AvatarWrap,
  Avatar,
  StatRowTop,
  StatBlock,
  StatVal,
  StatRow,
} from './Profile.styles';

import { StatsModal } from './components/StatsModal';
import { HistoryModal } from './components/HistoryModal';

export function Profile() {
  const vm = useProfileViewModel();
  const navigate = useNavigate();

  if (!vm.profile || !vm.user) {
    return <Loader />;
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

  const statRows = [
    { label: 'Всего гонок', value: user.stats.totalRaces },
    { label: 'Win Rate (PvP)', value: `${vm.winRate}%` },
    {
      label: 'Лучшее время (1/4)',
      value: user.stats.bestTime > 0 ? `${user.stats.bestTime.toFixed(3)}с` : '—',
    },
    { label: 'Perfect переключения', value: user.stats.perfectShifts },
    { label: 'Макс. серия побед', value: user.stats.longestWinStreak },
    { label: 'Монет заработано', value: user.stats.coinsEarned.toLocaleString() },
    { label: 'Rank Points', value: user.rankPoints },
  ];

  return (
    <Screen style={{ padding: 0 }}>
      <ProfileTopBar>
        <TopLeft>
          <IconButton onClick={() => navigate(PATHS.SETTINGS)}>
            <MaskIcon $src={settingsIcon} $size={26} />
          </IconButton>
          <IconButton onClick={() => navigate(PATHS.NOTIFICATIONS)}>
            <MaskIcon $src={bellIcon} $size={24} />
            <BellBadge />
          </IconButton>
        </TopLeft>

        <TopRight>
          <BalanceBadge>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="#b8ff22" strokeWidth="2.5"/>
              <path d="M10 5V15" stroke="#b8ff22" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            {user.coins.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <div onClick={() => navigate(PATHS.SHOP)} style={{ cursor: 'pointer', display: 'flex' }}>
              <MaskIcon $src={addCircleIcon} $color="#b8ff22" $size={28} />
            </div>
          </BalanceBadge>
        </TopRight>
      </ProfileTopBar>

      <div style={{ textAlign: 'center', marginBottom: 16, padding: '0 16px' }}>
        <AvatarWrap>
          <Avatar>{user.firstName.charAt(0)}</Avatar>
        </AvatarWrap>
        <Heading style={{ fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{user.firstName}</Heading>
        <Muted style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255, 255, 255, 0.4)' }}>@{user.username || 'driver'}</Muted>

        <StatRowTop>
          <StatBlock>
            <StatVal>
              <MaskIcon $src={cupIcon} $color="#b8ff22" $size={24} />
              {vm.winRate}%
            </StatVal>
            <Muted $size={14} style={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>Win/Lose</Muted>
          </StatBlock>
          <StatBlock>
            <StatVal>
              <MaskIcon $src={verifiedCheckIcon} $color="#b8ff22" $size={24} />
              {user.level}
            </StatVal>
            <Muted $size={14} style={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>Level</Muted>
          </StatBlock>
          <StatBlock>
            <StatVal>
              <MaskIcon $src={calendarIcon} $color="#b8ff22" $size={24} />
              {Math.max(1, user.stats.totalRaces)}
            </StatVal>
            <Muted $size={14} style={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>Days</Muted>
          </StatBlock>
        </StatRowTop>

        {profile.clan && (
          <Muted $size={11} style={{ display: 'block', marginTop: 8 }}>
            🛡️ [{profile.clan.tag || ''}] {profile.clan.name} · {profile.clan.role}
          </Muted>
        )}
      </div>

      <DailyBonusWidget days={vm.dailyBonusDays} onClaim={vm.claimDailyBonus} />

      <div style={{ padding: '0 16px' }}>
        <Button $variant="outline" $size="sm" $block style={{ marginBottom: 16 }} onClick={vm.loadLeaderboard}>
          🏅 Таблица лидеров
        </Button>

        <Card 
          style={{ marginBottom: 16, padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1C1C1C' }}
          onClick={() => vm.setTasksModalOpen(true)}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Задания и Ачивки</div>
            <Muted $size={13}>{vm.completedAchievements.length} выполнено</Muted>
          </div>
          <MaskIcon $src={verifiedCheckIcon} $color="#cfff04" $size={36} />
        </Card>

        {/* Dashboard Grid for Stats and History */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {/* STATS CARD */}
          <div 
            onClick={() => vm.setStatsModalOpen(true)}
            style={{ 
              background: '#1C1C1C', 
              borderRadius: 20, 
              padding: 20, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 8,
              cursor: 'pointer' 
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>
              ТВОИ ДАННЫЕ
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#cfff04', lineHeight: 1.1 }}>
              ПОСМОТРЕТЬ<br/>СТАТИСТИКУ
            </div>
          </div>

          {/* HISTORY CARD */}
          <div 
            onClick={() => vm.setHistoryModalOpen(true)}
            style={{ 
              background: '#1C1C1C', 
              borderRadius: 20, 
              padding: 20, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 8,
              cursor: 'pointer',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <MaskIcon $src={cupIcon} $color="#666" $size={48} style={{ marginBottom: 4 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              История гонок
            </div>
            <div style={{ fontSize: 13, color: '#cfff04', fontWeight: 600 }}>
              {profile.recentRaces.length} заездов
            </div>
          </div>
        </div>
      </div>

      <TasksModal 
        isOpen={vm.isTasksModalOpen} 
        onClose={() => vm.setTasksModalOpen(false)} 
        inProcess={vm.inProcessAchievements}
        completed={vm.completedAchievements}
      />
      
      <StatsModal 
        isOpen={vm.isStatsModalOpen} 
        onClose={() => vm.setStatsModalOpen(false)} 
        stats={statRows}
      />

      <HistoryModal
        isOpen={vm.isHistoryModalOpen}
        onClose={() => vm.setHistoryModalOpen(false)}
        races={profile.recentRaces}
        userId={user.id}
      />
    </Screen>
  );
}
