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
    try {
      await api.auth.selectStarter(selected);
      await fetchUser();
      onDone();
    } catch (e) {
      console.error(e);
      // Если сервер говорит, что машина уже выбрана (или что-то пошло не так), 
      // просто обновляем стейт и идем дальше.
      if ((e as Error).message?.includes('already selected') || (e as Error).message?.includes('уже выбрана')) {
        await fetchUser();
        onDone();
      } else {
        setLoading(false);
        // В идеале тут бы показать тост с ошибкой
      }
    }
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
