import styled from 'styled-components';
import { useGameStore } from '../../models/store';

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
`;

const XpTrack = styled.div`
  width: 50px;
  height: 4px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border-radius: 2px;
  overflow: hidden;
`;

const XpFill = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background: ${({ theme }) => theme.colors.accent};
`;

const Currencies = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Money = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;

const BellWrap = styled.div`
  position: relative;
  cursor: pointer;
  font-size: 18px;
`;

const BellBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -6px;
  background: ${({ theme }) => theme.colors.red};
  color: white;
  font-size: 9px;
  font-weight: 700;
  border-radius: 8px;
  padding: 1px 4px;
  min-width: 14px;
  text-align: center;
`;

export function TopBar() {
  const { user, unreadCount, setScreen } = useGameStore();
  if (!user) return null;

  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);

  return (
    <Bar>
      <Profile onClick={() => setScreen('profile')}>
        <Avatar>{user.firstName?.charAt(0) || '?'}</Avatar>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user.firstName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#8890a8' }}>Ур.{user.level}</span>
            <XpTrack>
              <XpFill $pct={xpPercent} />
            </XpTrack>
          </div>
        </div>
      </Profile>

      <Currencies>
        <Money $color="#c0c7d4">🪙 {user.silver.toLocaleString()}</Money>
        <Money $color="#ffd700">💎 {user.gold.toLocaleString()}</Money>
        <BellWrap onClick={() => setScreen('notifications')}>
          🔔
          {unreadCount > 0 && <BellBadge>{unreadCount}</BellBadge>}
        </BellWrap>
        <span style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => setScreen('settings')}>
          ⚙️
        </span>
      </Currencies>
    </Bar>
  );
}
