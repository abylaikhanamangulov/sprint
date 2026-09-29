import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Grid } from 'src/views/ui';
import { GlassModal } from 'src/components/ui/GlassModal/GlassModal';
import { useRewardsViewModel } from './RewardsViewModel';

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  background: rgba(255,255,255,0.05);
  padding: 4px;
  border-radius: 8px;
`;

const Tab = styled.button<{ $active?: boolean }>`
  flex: 1;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#8890a8')};
  border: none;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

const DayBox = styled.div<{ $state: 'claimed' | 'missed' | 'today' | 'future' }>`
  background: ${({ $state, theme }) => 
    $state === 'claimed' ? 'rgba(46, 204, 113, 0.2)' :
    $state === 'today' ? 'rgba(52, 152, 219, 0.4)' :
    $state === 'missed' ? 'rgba(255, 255, 255, 0.02)' :
    'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${({ $state }) => 
    $state === 'claimed' ? 'rgba(46, 204, 113, 0.5)' :
    $state === 'today' ? 'rgba(52, 152, 219, 0.8)' :
    'transparent'};
  border-radius: 8px;
  padding: 8px 4px;
  text-align: center;
  position: relative;
  opacity: ${({ $state }) => $state === 'missed' ? 0.5 : 1};
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  
  .day-num {
    font-weight: bold;
    margin-bottom: 4px;
    color: ${({ $state }) => $state === 'today' ? '#fff' : '#aaa'};
  }
`;

const EventCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(255,255,255,0.1);
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function RewardsModal({ isOpen, onClose }: Props) {
  const vm = useRewardsViewModel();
  const [tab, setTab] = useState<'daily' | 'events'>('daily');

  if (!isOpen) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Награды"
      icon={<div style={{ fontSize: '32px' }}>🎁</div>}
      actionText="Закрыть"
      description={
        <>
      <Tabs>
        <Tab $active={tab === 'daily'} onClick={() => setTab('daily')}>Календарь</Tab>
        <Tab $active={tab === 'events'} onClick={() => setTab('events')}>
          События 
          {vm.status && (vm.status.canClaimFounder || vm.status.activeHolidays.some(h => !h.claimed)) && ' 🔴'}
        </Tab>
      </Tabs>

      {vm.loading && <div style={{ textAlign: 'center', padding: 20 }}>Загрузка...</div>}
      
      {!vm.loading && vm.status && tab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Grid $cols={5} style={{ gap: 6 }}>
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const isClaimed = vm.status!.claimedDays.includes(day);
              const isToday = vm.status!.today === day;
              const isPast = day < vm.status!.today;
              
              let state: 'claimed' | 'missed' | 'today' | 'future' = 'future';
              if (isClaimed) state = 'claimed';
              else if (isToday) state = 'today';
              else if (isPast) state = 'missed';

              return (
                <DayBox key={day} $state={state}>
                  <div className="day-num">{day}</div>
                  <div style={{ fontSize: 16 }}>
                    {state === 'claimed' ? '✅' : state === 'missed' ? '❌' : '🎁'}
                  </div>
                </DayBox>
              );
            })}
          </Grid>
          
          <Button 
            $variant="primary" 
            $block 
            disabled={!vm.status.dailyRewardAvailable || vm.claiming}
            onClick={vm.claimDaily}
          >
            {vm.claiming ? '...' : vm.status.dailyRewardAvailable ? 'Забрать награду' : 'Уже забрано'}
          </Button>
        </div>
      )}

      {!vm.loading && vm.status && tab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vm.status.canClaimFounder && (
            <EventCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#f39c12' }}>👑 Подарок Основателя</h4>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>
                Спасибо, что вы с нами с самого старта! Заберите свой эксклюзивный подарок.
              </p>
              <Button $variant="primary" onClick={vm.claimFounder} disabled={vm.claiming}>
                Забрать
              </Button>
            </EventCard>
          )}

          {vm.status.activeHolidays.map(holiday => (
            <EventCard key={holiday.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#3498db' }}>🎉 {holiday.name}</h4>
              </div>
              {holiday.claimed ? (
                <Button $variant="outline" disabled>Уже забрано</Button>
              ) : (
                <Button $variant="primary" onClick={() => vm.claimHoliday(holiday.id)} disabled={vm.claiming}>
                  Забрать
                </Button>
              )}
            </EventCard>
          ))}

          {!vm.status.canClaimFounder && vm.status.activeHolidays.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>
              Сейчас нет доступных событий. Возвращайтесь позже!
            </div>
          )}
        </div>
      )}
      </>
      }
    />
  );
}
