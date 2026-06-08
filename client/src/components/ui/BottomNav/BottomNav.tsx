import styled from 'styled-components';
import { useBottomNavViewModel } from './BottomNavViewModel';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  
  background: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  z-index: 100;
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 4px;
  color: ${({ $isActive }) => ($isActive ? '#cfff04' : '#8890a8')};
  cursor: pointer;
  transition: color 0.2s;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  min-width: 60px;

  svg {
    margin-bottom: 4px;
  }
`;

const TabLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
`;

export function BottomNav() {
  const { tabs, activeTabId, handleTabClick } = useBottomNavViewModel();

  return (
    <NavContainer>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTabId === tab.id;

        return (
          <TabButton
            key={tab.id}
            $isActive={isActive}
            onClick={() => handleTabClick(tab.path)}
            aria-label={tab.label}
            title={tab.label}
          >
            <Icon 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2} 
              fill={isActive ? '#cfff04' : 'none'}
              color={isActive ? '#cfff04' : '#8890a8'}
            />
            <TabLabel>{tab.label}</TabLabel>
          </TabButton>
        );
      })}
    </NavContainer>
  );
}
