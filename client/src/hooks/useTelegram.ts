declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            username?: string;
            first_name: string;
            photo_url?: string;
            language_code?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        openInvoice?: (url: string, callback?: (status: string) => void) => void;
        close: () => void;
        BackButton: {
          isVisible: boolean;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        colorScheme: 'light' | 'dark';
      };
    };
  }
}

export function useTelegram() {
  const tg = window.Telegram?.WebApp;

  const user = tg?.initDataUnsafe?.user;

  const telegramData = {
    telegramId: user?.id || 100001,
    username: user?.username || 'dev_user',
    firstName: user?.first_name || 'Developer',
    avatarUrl: user?.photo_url || '',
  };

  const haptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    tg?.HapticFeedback?.impactOccurred(type);
  };

  const isDark = tg?.colorScheme === 'dark';

  return { tg, user, telegramData, haptic, isDark };
}
