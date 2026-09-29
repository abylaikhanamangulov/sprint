export interface RewardData {
  coins?: number;
  xp?: number;
  points?: number; // Премиум валюта
  silverPacks?: number; // Количество серебряных паков
}

export interface HolidayConfig {
  id: string;
  name: string;
  startDate: string; // ISO формат, например "2026-12-25T00:00:00.000Z"
  endDate: string; // ISO формат, например "2027-01-05T00:00:00.000Z"
  reward: RewardData;
}

// Дата выхода игры (от нее отсчитываем 14 дней для "олдов")
// Можно поменять на реальную дату релиза
export const GAME_LAUNCH_DATE = new Date('2026-09-01T00:00:00.000Z');
export const FOUNDER_CUTOFF_DATE = new Date(GAME_LAUNCH_DATE.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 дней

export const FOUNDER_REWARD: RewardData = {
  coins: 50000,
  points: 500,
  silverPacks: 3
};

export const HOLIDAYS: HolidayConfig[] = [
  {
    id: 'new_year_2027',
    name: 'Новогодний подарок 2027',
    startDate: '2026-12-25T00:00:00.000Z',
    endDate: '2027-01-10T00:00:00.000Z',
    reward: { coins: 25000, points: 250, silverPacks: 1 }
  },
  {
    id: 'halloween_2026',
    name: 'Хэллоуин 2026',
    startDate: '2026-10-25T00:00:00.000Z',
    endDate: '2026-11-05T00:00:00.000Z',
    reward: { coins: 15000, xp: 5000 }
  }
];

// Ежедневные награды (31 день). Соблюдаем баланс и долгую прокачку.
export const DAILY_REWARDS: RewardData[] = [
  { coins: 1000, xp: 100 },       // День 1
  { coins: 1200, xp: 150 },       // День 2
  { coins: 1500, xp: 200 },       // День 3
  { coins: 1800, xp: 250 },       // День 4
  { coins: 2000, xp: 300 },       // День 5
  { coins: 2500, points: 10 },    // День 6
  { coins: 3000, silverPacks: 1 },// День 7 (Конец 1-й недели)
  
  { coins: 1500, xp: 200 },       // День 8
  { coins: 1800, xp: 250 },       // День 9
  { coins: 2000, xp: 300 },       // День 10
  { coins: 2200, xp: 350 },       // День 11
  { coins: 2500, xp: 400 },       // День 12
  { coins: 3000, points: 15 },    // День 13
  { coins: 4000, silverPacks: 1 },// День 14 (Конец 2-й недели)
  
  { coins: 2000, xp: 300 },       // День 15
  { coins: 2200, xp: 350 },       // День 16
  { coins: 2500, xp: 400 },       // День 17
  { coins: 2800, xp: 450 },       // День 18
  { coins: 3000, xp: 500 },       // День 19
  { coins: 3500, points: 20 },    // День 20
  { coins: 5000, silverPacks: 1 },// День 21 (Конец 3-й недели)
  
  { coins: 2500, xp: 400 },       // День 22
  { coins: 2800, xp: 450 },       // День 23
  { coins: 3000, xp: 500 },       // День 24
  { coins: 3500, xp: 600 },       // День 25
  { coins: 4000, xp: 700 },       // День 26
  { coins: 4500, points: 30 },    // День 27
  { coins: 6000, silverPacks: 2 },// День 28 (Конец 4-й недели)
  
  { coins: 5000, xp: 1000 },      // День 29
  { coins: 7500, points: 50 },    // День 30
  { coins: 10000, silverPacks: 3 }// День 31 (Самый жирный)
];
