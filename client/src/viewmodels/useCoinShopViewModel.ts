import { useState, useEffect } from 'react';
import { useGameStore } from 'src/models/store';
import { api } from 'src/models/api';
import { ShopData } from 'src/models/types';

export function useCoinShopViewModel() {
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<ShopData | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const data = await api.shop.get();
      setShop(data);
    } catch (e) {
      console.error('Failed to load coin shop:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const buyCoins = async (id: string) => {
    try {
      const res = await api.shop.createInvoice(id);
      if (res.success && res.url) {
        if (window.Telegram?.WebApp?.openInvoice) {
          window.Telegram.WebApp.openInvoice(res.url, async (status: string) => {
            if (status === 'paid') {
              await useGameStore.getState().fetchUser();
              setMessage(`Покупка успешно завершена!`);
              setTimeout(() => setMessage(null), 3000);
            } else {
              console.log('Payment status:', status);
            }
          });
        } else {
          // Fallback if not in Telegram
          alert(`Telegram Invoice URL (для отладки):\n${res.url}`);
        }
      }
    } catch (e) {
      alert((e as Error).message || 'Ошибка при создании счета');
    }
  };

  return {
    loading,
    shop,
    message,
    buyCoins,
    clearMessage: () => setMessage(null),
  };
}
