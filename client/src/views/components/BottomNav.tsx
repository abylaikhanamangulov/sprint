import styled from 'styled-components';
import { useGameStore } from '../../models/store';
import type { ScreenId } from '../../models/store';

const tabs: { id: ScreenId; icon: string; label: string }[] = [
  { id: 'garage', icon: '🏎️', label: 'Гараж' },
  { id: 'race', icon: '🏁', label: 'Гонка' },
  { id: 'hub', icon: '🏠', label: 'Меню' },
  { id: 'events', icon: '🏆', label: 'Турниры' },
  { id: 'clan', icon: '🛡️', label: 'Клан' },
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

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  padding: 4px 12px;
  font-size: 20px;
  color: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.textSecondary)};

  span.label {
    font-size: 10px;
    font-weight: ${({ $active }) => ($active ? 700 : 400)};
  }
`;

export function BottomNav() {
  const { selectedScreen, setScreen } = useGameStore();
  return (
    <Nav>
      {tabs.map((tab) => (
        <Tab key={tab.id} $active={selectedScreen === tab.id} onClick={() => setScreen(tab.id)}>
          <span>{tab.icon}</span>
          <span className="label">{tab.label}</span>
        </Tab>
      ))}
    </Nav>
  );
}
