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
  const [showSplash, setShowSplash] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    tg?.ready();
    tg?.expand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showSplash) login(telegramData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSplash]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      if (!isNew && user.selectedCarId) setOnboarded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  let stage: AppStage;
  if (showSplash) stage = 'splash';
  else if (loading) stage = 'loading';
  else if (isNew || (user && !user.selectedCarId)) stage = 'welcome';
  else if (!onboarded || !user) stage = 'loading';
  else stage = 'ready';

  return {
    stage,
    finishSplash: () => setShowSplash(false),
    finishOnboarding: () => setOnboarded(true),
  };
}
