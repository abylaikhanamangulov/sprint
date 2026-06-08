import React from 'react';
import styled from 'styled-components';
import { BottomModal } from 'src/components/ui/BottomModal/BottomModal';
import { User, RaceResult } from 'src/models/types';

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #8890a8;
  font-size: 14px;
`;

const RaceCard = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ResultText = styled.span<{ $isWinner: boolean }>`
  font-weight: 800;
  font-size: 14px;
  color: ${({ $isWinner }) => ($isWinner ? '#cfff04' : '#ff4757')};
  text-transform: uppercase;
`;

const RaceType = styled.span`
  font-size: 12px;
  color: #888;
  font-weight: 500;
`;

const TimeText = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
`;

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  races: RaceResult[];
  userId: number;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, races, userId }) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="История гонок">
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
        {races.map((r) => {
          const isWinner = r.winnerId === userId;
          return (
            <RaceCard key={r.id}>
              <ResultWrap>
                <ResultText $isWinner={isWinner}>
                  {isWinner ? 'ПОБЕДА' : 'ПРОИГРЫШ'}
                </ResultText>
                <RaceType>{r.type}</RaceType>
              </ResultWrap>
              <TimeText>{r.player1.time.toFixed(3)}с</TimeText>
            </RaceCard>
          );
        })}
        {races.length === 0 && <EmptyState>У тебя пока нет истории гонок</EmptyState>}
      </div>
    </BottomModal>
  );
};
