import styled from 'styled-components';

const TabsWrapper = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0 16px 0;
  
  /* Hide scrollbar for a cleaner look */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  white-space: nowrap;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)')};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 100px;
  padding: 8px 16px;
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)')};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)')};
    color: #ffffff;
  }
`;

export interface GlassTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function GlassTabs({ tabs, activeTab, onChange }: GlassTabsProps) {
  return (
    <TabsWrapper>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          $active={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </TabButton>
      ))}
    </TabsWrapper>
  );
}
