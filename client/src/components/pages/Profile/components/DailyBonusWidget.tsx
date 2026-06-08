import React from 'react';
import styled from 'styled-components';
import type { DailyBonusDay } from '../Profile.types';

const WidgetContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 16px 20px;
  margin-top: -10px; /* Slight overlap or margin adjustments to fit right under the header */
  
  /* Hide scrollbar for a cleaner look */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const DayCard = styled.div<{ $isCurrent: boolean }>`
  flex: 0 0 auto;
  width: 52px;
  height: 90px;
  background-color: #1a1a1a;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  box-sizing: border-box;
  
  ${({ $isCurrent }) => $isCurrent && `
    border: 1.5px solid #b8ff22;
    cursor: pointer;
    transition: transform 0.1s ease-in-out;
    &:active {
      transform: scale(0.95);
    }
  `}
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  height: 6px;
  align-items: center;
`;

const Dot = styled.div<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`;

const DayName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
`;

const DayDate = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

interface DailyBonusWidgetProps {
  days: DailyBonusDay[];
  onClaim?: () => void;
}

export const DailyBonusWidget: React.FC<DailyBonusWidgetProps> = ({ days, onClaim }) => {
  const getDotColor = (status: DailyBonusDay['status']) => {
    switch (status) {
      case 'collected': return '#b8ff22';
      case 'current': return '#ffffff';
      case 'missed': return '#444444';
      default: return '#ffffff';
    }
  };

  return (
    <WidgetContainer>
      {days.map((day, idx) => (
        <DayCard 
          key={`${day.dateStr}-${idx}`} 
          $isCurrent={day.isToday}
          onClick={() => {
            if (day.isToday && onClaim) {
              onClaim();
            }
          }}
        >
          <DotsContainer>
            {day.isToday ? (
              // Replicating exactly the photo's 3 dots for the current highlighted day
              <>
                <Dot $color="#b8ff22" />
                <Dot $color="#ffffff" />
                <Dot $color="#444444" />
              </>
            ) : (
              <Dot $color={getDotColor(day.status)} />
            )}
          </DotsContainer>
          <DayName>{day.dayName}</DayName>
          <DayDate>{day.dateStr}</DayDate>
        </DayCard>
      ))}
    </WidgetContainer>
  );
};
