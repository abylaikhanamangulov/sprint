import { useState, useEffect } from 'react';
import { useGameStore } from 'src/models/store';
import { api } from 'src/models/api';

export function useCoinShopViewModel() {
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchShop = async () => {
    try {
      setLoading(true);
      const data = await api.shop.getShop();
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
      const res = await api.shop.buyCoins(id, 'stars');
      if (res.success) {
        useGameStore.getState().updateUser({ coins: useGameStore.getState().user!.coins + res.coinsAdded });
        setMessage(`Куплено ${res.coinsAdded.toLocaleString()} монет!`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e: any) {
      alert(e.message || 'Ошибка при покупке');
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
