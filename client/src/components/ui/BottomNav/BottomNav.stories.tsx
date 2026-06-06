import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/views/theme/theme';
import { BottomNav } from './BottomNav';

const meta = {
  title: 'UI/BottomNav',
  component: BottomNav,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/']}>
          <div style={{ height: '300px', background: 'radial-gradient(circle at 50% 40%, #1a1d29 0%, #05070a 100%)', position: 'relative' }}>
            <Story />
          </div>
        </MemoryRouter>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
