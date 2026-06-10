import { useEffect, useState } from 'react';
import { api } from 'src/models/api';
import { getErrorMessage } from 'src/models/errors';
import { useGameStore } from 'src/models/store';
import type { ShopData } from 'src/models/types';

export type ShopTab = 'deals' | 'packs' | 'crates' | 'cosmetics';

interface ShopViewModel {
  shop: ShopData | null;
  loading: boolean;
  tab: ShopTab;
  message: string | null;
  setTab: (t: ShopTab) => void;
  buyCosmetic: (id: string) => Promise<void>;
  buyCrate: (id: string) => Promise<void>;
  openPack: (id: string) => Promise<void>;
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

  const openPack = async (id: string) => {
    try {
      const result = await api.shop.openPack(id);
      
      const dropDetails = result.drops.map(d => {
        if (d.type === 'upgrade_card') return `Карта улучшения (${d.data.category}) x${d.amount}`;
        if (d.type === 'ecu_card') return `ЭБУ карта x${d.amount}`;
        if (d.type === 'points') return `Спринтпоинты x${d.amount}`;
        if (d.type === 'car_fragment') return `Фрагмент машины x${d.amount}`;
        return 'Предмет';
      });

      setMessage(`Открыт пак! Выпало:\n${dropDetails.join('\n')}`);
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
    openPack,
    clearMessage: () => setMessage(null),
  };
}
