import React from 'react';
import styled from 'styled-components';
import { BottomModal } from 'src/components/ui/BottomModal/BottomModal';

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #2a2a2a;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #888;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 16px;
  color: #fff;
  font-weight: 700;
`;

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: { label: string; value: string | number }[];
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="Твоя статистика">
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: '0 20px' }}>
          {stats.map((row) => (
            <StatRow key={row.label}>
              <StatLabel>{row.label}</StatLabel>
              <StatValue>{row.value}</StatValue>
            </StatRow>
          ))}
        </div>
      </div>
    </BottomModal>
  );
};
