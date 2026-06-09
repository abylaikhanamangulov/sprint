import { useEffect, useState } from 'react';
import { api } from 'src/models/api';
import { getErrorMessage } from 'src/models/errors';
import { useGameStore } from 'src/models/store';
import type { ShopData } from 'src/models/types';

export type ShopTab = 'deals' | 'crates' | 'cosmetics';

interface ShopViewModel {
  shop: ShopData | null;
  loading: boolean;
  tab: ShopTab;
  message: string | null;
  setTab: (t: ShopTab) => void;
  buyCosmetic: (id: string) => Promise<void>;
  buyCrate: (id: string) => Promise<void>;
  clearMessage: () => void;
}

export function useShopViewModel(): ShopViewModel {
  const { fetchUser } = useGameStore();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [tab, setTab] = useState<ShopTab>('deals');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.shop.get().then((data) => {
      setShop(data);
      setLoading(false);
    });
  }, []);

  const buyCosmetic = async (id: string) => {
    try {
      await api.shop.buyCosmetic(id);
      setMessage('Куплено!');
      fetchUser();
    } catch (e: unknown) {
      setMessage(getErrorMessage(e));
    }
  };

  const buyCrate = async (id: string) => {
    try {
      const result = await api.shop.buyCrate(id);
      setMessage(`Открыт кейс! Дроп: ${result.drops.join(', ')}`);
      fetchUser();
    } catch (e: unknown) {
      setMessage(getErrorMessage(e));
    }
  };

  return {
    shop,
    loading,
    tab,
    message,
    setTab,
    buyCosmetic,
    buyCrate,
    clearMessage: () => setMessage(null),
  };
}
