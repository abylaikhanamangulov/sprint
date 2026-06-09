import { useState } from 'react';
import { api } from 'src/models/api';
import { useGameStore } from 'src/models/store';
import type { UserSettings } from 'src/models/types';

const DEFAULT_SETTINGS: UserSettings = {
  language: 'ru',
  soundEffects: true,
  music: true,
  musicVolume: 70,
  vibration: true,
  graphicsQuality: 'high',
  notifications: true,
  showFps: false,
};

interface SettingsViewModel {
  settings: UserSettings;
  saving: boolean;
  saved: boolean;
  update: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  save: () => Promise<void>;
  back: () => void;
}

export function useSettingsViewModel(): SettingsViewModel {
  const { user, fetchUser, setScreen } = useGameStore();
  const [settings, setSettings] = useState<UserSettings>(user?.settings ?? DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    await api.profile.updateSettings(settings);
    await fetchUser();
    setSaving(false);
    setSaved(true);
  };

  return { settings, saving, saved, update, save, back: () => setScreen('hub') };
}
