import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, ScreenId } from 'src/models/store';
import type { MyCar } from 'src/models/types';

interface HubViewModel {
  selectedCar: MyCar | undefined;
  carCount: number;
  energy: number;
  maxEnergy: number;
  go: (screen: ScreenId) => void;
}

export function useHubViewModel(): HubViewModel {
  const navigate = useNavigate();
  const { user, myCars, fetchMyCars } = useGameStore();

  useEffect(() => {
    fetchMyCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCar = myCars.find((c) => c.isSelected) ?? myCars[0];

  return {
    selectedCar,
    carCount: myCars.length,
    energy: user?.energy ?? 0,
    maxEnergy: user?.maxEnergy ?? 0,
    go: (screen: ScreenId) => navigate(`/${screen}`),
  };
}
