import { useEffect, useState } from 'react';
import { useGameStore } from '../models/store';
import { useTelegram } from '../hooks/useTelegram';

type AppStage = 'splash' | 'loading' | 'welcome' | 'ready';

interface AppViewModel {
  stage: AppStage;
  finishSplash: () => void;
  finishOnboarding: () => void;
}

export function useAppViewModel(): AppViewModel {
  const { tg, telegramData } = useTelegram();
  const { user, isNew, loading, login, fetchNotifications } = useGameStore();
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    login(telegramData); // Start login immediately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      if (user.selectedCarId) setOnboarded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  let stage: AppStage;
  if (loading) stage = 'loading';
  else if (user && !user.selectedCarId) stage = 'welcome';
  else if (!onboarded || !user) stage = 'loading';
  else stage = 'ready';

  return {
    stage,
    finishSplash: () => {}, // No longer used, but kept for interface compatibility
    finishOnboarding: () => setOnboarded(true),
  };
}
