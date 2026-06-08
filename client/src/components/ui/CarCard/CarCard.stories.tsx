import type { Meta, StoryObj } from '@storybook/react';
import { CarCard } from './CarCard';
import styled from 'styled-components';

// A dark/colorful background wrapper to show off the glassmorphism effect
const DarkBackground = styled.div`
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  min-height: 100vh;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StoryWrapper = styled.div`
  width: 100%;
  max-width: 400px; /* Constrain width to simulate mobile/card view */
`;

const meta = {
  title: 'UI/CarCard',
  component: CarCard,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <DarkBackground>
        <StoryWrapper>
          <Story />
        </StoryWrapper>
      </DarkBackground>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof CarCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imageSrc: '/mustang.png',
    name: 'Ford Mustang GT 2022',
    price: '74,000 монет',
  },
};
