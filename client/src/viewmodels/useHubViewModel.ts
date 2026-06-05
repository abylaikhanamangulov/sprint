import { useEffect, useState } from 'react';
import { api } from '../models/api';
import { useGameStore } from '../models/store';
import type { DailyRewardResponse, MyCar } from '../models/types';

interface HubViewModel {
  dailyAvailable: boolean;
  claiming: boolean;
  dailyResult: DailyRewardResponse | null;
  selectedCar: MyCar | undefined;
  carCount: number;
  energy: number;
  maxEnergy: number;
  dailyStreak: number;
  claimDaily: () => Promise<void>;
  go: ReturnType<typeof useGameStore.getState>['setScreen'];
}

export function useHubViewModel(): HubViewModel {
  const { user, myCars, setScreen, fetchMyCars, fetchUser } = useGameStore();
  const [dailyAvailable, setDailyAvailable] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [dailyResult, setDailyResult] = useState<DailyRewardResponse | null>(null);

  useEffect(() => {
    fetchMyCars();
    if (user?.lastDailyReward) {
      const hours = (Date.now() - new Date(user.lastDailyReward).getTime()) / (1000 * 60 * 60);
      setDailyAvailable(hours >= 20);
    } else {
      setDailyAvailable(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCar = myCars.find((c) => c.isSelected) ?? myCars[0];

  const claimDaily = async () => {
    setClaiming(true);
    try {
      const result = await api.auth.claimDaily();
      setDailyResult(result);
      setDailyAvailable(false);
      fetchUser();
    } catch {
      // ignore — daily reward failures are non-critical
    }
    setClaiming(false);
  };

  return {
    dailyAvailable,
    claiming,
    dailyResult,
    selectedCar,
    carCount: myCars.length,
    energy: user?.energy ?? 0,
    maxEnergy: user?.maxEnergy ?? 0,
    dailyStreak: user?.dailyStreak ?? 0,
    claimDaily,
    go: setScreen,
  };
}
