import { useEffect, useState } from 'react';
import { api } from '../models/api';
import { getErrorMessage } from '../models/errors';
import { useGameStore } from '../models/store';
import { DEFAULT_COSMETICS } from '../models/types';
import type { Car, CarCosmetics, MyCar, Tuning, UpgradeCategoryView } from '../models/types';

export type GarageTab = 'overview' | 'upgrades' | 'tuning' | 'look';

interface GarageViewModel {
  myCars: MyCar[];
  selectedEntry: MyCar | undefined;
  upgrades: UpgradeCategoryView[];
  tuning: Tuning | null;
  cosmetics: CarCosmetics;
  tab: GarageTab;
  showDealership: boolean;
  available: Car[];
  error: string | null;
  cosmeticsSaved: boolean;
  setTab: (t: GarageTab) => void;
  selectEntry: (carId: number) => void;
  openDealership: () => Promise<void>;
  closeDealership: () => void;
  doUpgrade: (categoryId: string) => Promise<void>;
  setTuningField: (key: keyof Tuning, value: number | string) => void;
  saveTuning: () => Promise<void>;
  setCosmeticField: <K extends keyof CarCosmetics>(key: K, value: CarCosmetics[K]) => void;
  saveCosmetics: () => Promise<void>;
  buyCar: (carId: number) => Promise<void>;
}

export function useGarageViewModel(): GarageViewModel {
  const { myCars, fetchMyCars, fetchUser } = useGameStore();
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [upgrades, setUpgrades] = useState<UpgradeCategoryView[]>([]);
  const [tuning, setTuning] = useState<Tuning | null>(null);
  const [cosmetics, setCosmetics] = useState<CarCosmetics>(DEFAULT_COSMETICS);
  const [cosmeticsSaved, setCosmeticsSaved] = useState(false);
  const [tab, setTab] = useState<GarageTab>('overview');
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [showDealership, setShowDealership] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedEntry =
    myCars.find((c) => c.carId === selectedCarId) ??
    myCars.find((c) => c.isSelected) ??
    myCars[0];

  useEffect(() => {
    if (selectedEntry) {
      setSelectedCarId(selectedEntry.carId);
      api.garage.upgrades(selectedEntry.carId).then(setUpgrades);
      api.garage.getTuning(selectedEntry.carId).then(setTuning);
      api.garage.getCosmetics(selectedEntry.carId).then(setCosmetics);
      setCosmeticsSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntry?.carId]);

  const selectCar = async (carId: number) => {
    await api.garage.select(carId);
    fetchMyCars();
    fetchUser();
  };

  const openDealership = async () => {
    const cars = await api.cars.list();
    setAllCars(cars);
    setShowDealership(true);
  };

  const doUpgrade = async (categoryId: string) => {
    if (!selectedEntry) return;
    try {
      await api.garage.upgrade(selectedEntry.carId, categoryId);
      const updated = await api.garage.upgrades(selectedEntry.carId);
      setUpgrades(updated);
      fetchMyCars();
      fetchUser();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  const setTuningField = (key: keyof Tuning, value: number | string) => {
    setTuning((t) => (t ? { ...t, [key]: value } : t));
  };

  const saveTuning = async () => {
    if (!selectedEntry || !tuning) return;
    await api.garage.saveTuning(selectedEntry.carId, tuning);
  };

  const setCosmeticField = <K extends keyof CarCosmetics>(key: K, value: CarCosmetics[K]) => {
    setCosmetics((c) => ({ ...c, [key]: value }));
    setCosmeticsSaved(false);
  };

  const saveCosmetics = async () => {
    if (!selectedEntry) return;
    await api.garage.saveCosmetics(selectedEntry.carId, cosmetics);
    fetchMyCars(); // so the new look shows on hub/race
    setCosmeticsSaved(true);
  };

  const buyCar = async (carId: number) => {
    try {
      await api.cars.buy(carId);
      await selectCar(carId);
      setShowDealership(false);
      fetchUser();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  const ownedIds = myCars.map((c) => c.carId);
  const available = allCars.filter((c) => !c.isStarter && !ownedIds.includes(c.id));

  return {
    myCars,
    selectedEntry,
    upgrades,
    tuning,
    cosmetics,
    cosmeticsSaved,
    tab,
    showDealership,
    available,
    error,
    setTab,
    selectEntry: (carId) => {
      setSelectedCarId(carId);
      selectCar(carId);
    },
    openDealership,
    closeDealership: () => setShowDealership(false),
    doUpgrade,
    setTuningField,
    saveTuning,
    setCosmeticField,
    saveCosmetics,
    buyCar,
  };
}
