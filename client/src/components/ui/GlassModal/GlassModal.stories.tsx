import type { Meta, StoryObj } from '@storybook/react';
import { GlassModal } from './GlassModal';
import styled from 'styled-components';
import { useState } from 'react';
import { Tag } from 'lucide-react';

const DarkBackground = styled.div`
  background: linear-gradient(135deg, #1e1e1e 0%, #000000 100%);
  min-height: 100vh;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const OpenButton = styled.button`
  padding: 12px 24px;
  background: #2ed573;
  color: #000;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
`;

// A wrapper to handle the isOpen state for Storybook
const ModalWrapper = (props: any) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <DarkBackground>
      {!isOpen && (
        <OpenButton onClick={() => setIsOpen(true)}>
          Открыть модалку
        </OpenButton>
      )}
      <GlassModal 
        {...props} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </DarkBackground>
  );
};

const meta = {
  title: 'UI/GlassModal',
  component: GlassModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GlassModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
    onClose: () => {},
    icon: <div style={{ 
      background: 'linear-gradient(135deg, #ff4757, #ff6b81)', 
      padding: '16px', 
      borderRadius: '20px', 
      boxShadow: '0 10px 20px rgba(255, 71, 87, 0.4)',
      transform: 'rotate(-10deg)'
    }}><Tag size={32} color="#fff" strokeWidth={2.5} /></div>,
    title: 'Теперь цена прозрачна',
    description: 'Мы убрали скрытые комиссии. Теперь вы видите финальную цену поездки сразу.',
    actionText: 'Понятно',
    primaryAction: true,
  },
};

export const DailyReward: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
    onClose: () => {},
    icon: <div style={{ fontSize: '72px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>🎁</div>,
    title: 'Ежедневная награда',
    description: (
      <>
        Вы зашли в игру <strong>3 дня подряд</strong>!<br/>
        Получите бонус: <span style={{ color: '#e8eaf0' }}>200 🪙</span> и <span style={{ color: '#ffd700' }}>5 💎</span>
      </>
    ),
    actionText: 'Забрать',
    primaryAction: true,
  },
};

export const CarUnlocked: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    isOpen: true,
    onClose: () => {},
    imageSrc: '/mustang.png',
    title: 'Новая тачка разблокирована!',
    description: 'Ford Mustang GT 2022 добавлен в ваш гараж. Перейдите в гараж, чтобы настроить внешний вид и тюнинг.',
    actionText: 'В гараж',
    primaryAction: true,
  },
};
