export type ProfileTab = 'stats' | 'history';

export type DailyBonusStatus = 'collected' | 'current' | 'missed';

export interface DailyBonusDay {
  dayName: string;
  dateStr: string;
  status: DailyBonusStatus;
  isToday: boolean;
}
