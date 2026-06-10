import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from 'src/models/store';
import { PATHS } from 'src/routes/paths';
import coinIcon from 'src/components/icons/assets/coin.svg';

const TopBarContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  
  background: rgba(18, 18, 18, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px 12px 4px 4px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Avatar = styled.div<{ $url?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #333;
  background-image: url(\${({ $url }) => $url || ''});
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
`;

const UserLevel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #cfff04;
`;

const BalanceBadge = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(207, 255, 4, 0.3);
  border-radius: 20px;
  padding: 4px 4px 4px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: #cfff04;
  }
`;

const BalanceText = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.5px;
`;

const PlusCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #cfff04;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  box-shadow: 0 0 10px rgba(207, 255, 4, 0.4);
`;

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1V13M1 7H13" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export function GlobalTopBar() {
  const navigate = useNavigate();
  const user = useGameStore((state) => state.user);

  if (!user) return null;

  return (
    <TopBarContainer>
      <UserSection onClick={() => navigate(PATHS.PROFILE)}>
        <Avatar $url={user.avatarUrl}>
          {!user.avatarUrl && user.firstName?.[0]}
        </Avatar>
        <UserInfo>
          <UserName>{user.firstName || 'Гонщик'}</UserName>
          <UserLevel>Lvl {user.level || 1}</UserLevel>
        </UserInfo>
      </UserSection>

      <BalanceBadge onClick={() => navigate(PATHS.COIN_SHOP)}>
        <img src={coinIcon} alt="coin" style={{ width: 16, height: 16 }} />
        <BalanceText>
          {user.coins.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </BalanceText>
        <PlusCircle>
          <PlusIcon />
        </PlusCircle>
      </BalanceBadge>
    </TopBarContainer>
  );
}
