import styled from 'styled-components';
import { ProgressBar, ProgressFill } from '../ui';

const Bar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TopLine = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
`;

const DistLabel = styled.div`
  text-align: center;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface Props {
  raceTime: number;
  gear: number;
  maxGears: number;
  distance: number;
  total: number;
}

export function RaceHud({ raceTime, gear, maxGears, distance, total }: Props) {
  return (
    <Bar>
      <TopLine>
        <span>⏱ {raceTime.toFixed(2)}с</span>
        <span>⚙️ {gear}/{maxGears}</span>
      </TopLine>
      <ProgressBar $height={12}>
        <ProgressFill
          $pct={(distance / total) * 100}
          $bg="linear-gradient(90deg, #4e7cff, #2ed573)"
        />
      </ProgressBar>
      <DistLabel>
        {Math.round(distance)} м / {total} м
      </DistLabel>
    </Bar>
  );
}
