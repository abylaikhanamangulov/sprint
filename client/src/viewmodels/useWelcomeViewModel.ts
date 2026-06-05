import { useEffect, useState } from 'react';
import { api } from '../models/api';
import { useGameStore } from '../models/store';
import type { Car } from '../models/types';

interface WelcomeViewModel {
  firstName: string;
  starters: Car[];
  selected: number | null;
  loading: boolean;
  select: (id: number) => void;
  confirm: () => Promise<void>;
}

export function useWelcomeViewModel(onDone: () => void): WelcomeViewModel {
  const { user, fetchUser } = useGameStore();
  const [starters, setStarters] = useState<Car[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.cars.starters().then(setStarters);
  }, []);

  const confirm = async () => {
    if (!selected) return;
    setLoading(true);
    await api.auth.selectStarter(selected);
    await fetchUser();
    onDone();
  };

  return {
    firstName: user?.firstName ?? '',
    starters,
    selected,
    loading,
    select: setSelected,
    confirm,
  };
}
