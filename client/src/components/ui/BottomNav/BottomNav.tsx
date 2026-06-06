import styled from 'styled-components';
import { useBottomNavViewModel } from './BottomNavViewModel';

const NavContainer = styled.nav`
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  padding: 8px 12px;
  z-index: 100;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 1px rgba(255, 255, 255, 0.15); /* Top inner reflection */
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isActive }) => ($isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent')};
  border: none;
  border-radius: 100px;
  padding: 12px 28px; /* Wide padding for the pill shape */
  color: ${({ $isActive }) => ($isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)')};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    color: #ffffff;
    background: ${({ $isActive }) => ($isActive ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)')};
  }

  svg {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
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
              strokeWidth={isActive ? 2.2 : 1.5} 
              fill="none"
            />
          </TabButton>
        );
      })}
    </NavContainer>
  );
}
