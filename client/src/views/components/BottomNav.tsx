import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { PATHS } from 'src/routes/paths';

const tabs = [
  { path: PATHS.GARAGE, icon: '🏎️', label: 'Гараж' },
  { path: PATHS.RACE, icon: '🏁', label: 'Гонка' },
  { path: PATHS.HUB, icon: '🏠', label: 'Меню' },
  { path: PATHS.EVENTS, icon: '🏆', label: 'Турниры' },
  { path: PATHS.CLAN, icon: '🛡️', label: 'Клан' },
];

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 0 calc(12px + env(safe-area-inset-bottom));
  z-index: 100;
`;

const Tab = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  padding: 4px 12px;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;

  &.active {
    color: ${({ theme }) => theme.colors.accent};
    
    span.label {
      font-weight: 700;
    }
  }

  span.label {
    font-size: 10px;
    font-weight: 400;
  }
`;

export function BottomNav() {
  return (
    <Nav>
      {tabs.map((tab) => (
        <Tab key={tab.path} to={tab.path}>
          <span>{tab.icon}</span>
          <span className="label">{tab.label}</span>
        </Tab>
      ))}
    </Nav>
  );
}
