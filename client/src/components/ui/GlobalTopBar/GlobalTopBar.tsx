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
  
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const EnergyBadge = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EnergyText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #fff;
`;

const EnergyIcon = styled.span`
  font-size: 14px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px;
  border-radius: 20px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const Avatar = styled.div<{ $url?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #222;
  background-image: url(\${({ $url }) => $url || ''});
  background-size: cover;
  background-position: center;
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
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
`;

const UserLevel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #888;
`;

const BalanceBadge = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 4px 6px 4px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
`;

const BalanceText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.2px;
`;

const PlusCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #cfff04;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
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
      <LeftGroup>
        <UserSection onClick={() => navigate(PATHS.PROFILE)}>
          <Avatar $url={user.avatarUrl}>
            {!user.avatarUrl && user.firstName?.[0]}
          </Avatar>
          <UserInfo>
            <UserName>{user.firstName || 'Гонщик'}</UserName>
            <UserLevel>Lvl {user.level || 1}</UserLevel>
          </UserInfo>
        </UserSection>

        <EnergyBadge>
          <EnergyIcon>⚡</EnergyIcon>
          <EnergyText>{user.energy}/{user.maxEnergy}</EnergyText>
        </EnergyBadge>
      </LeftGroup>

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
