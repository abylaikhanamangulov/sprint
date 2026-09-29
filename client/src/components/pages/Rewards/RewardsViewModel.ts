import { useState, useEffect, useCallback } from 'react';
import { api } from 'src/models/api';
import { useGameStore } from 'src/models/store';

export interface RewardsStatus {
  currentMonth: string;
  today: number;
  claimedDays: number[];
  dailyRewardAvailable: boolean;
  canClaimFounder: boolean;
  activeHolidays: {
    id: string;
    name: string;
    reward: any;
    claimed: boolean;
  }[];
}

export function useRewardsViewModel() {
  const [status, setStatus] = useState<RewardsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const fetchUser = useGameStore((s) => s.fetchUser);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.rewards.status();
      setStatus(res);
    } catch (e) {
      console.error('Failed to fetch rewards status', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const claimDaily = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      await api.rewards.claimDaily();
      await fetchStatus();
      await fetchUser();
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  };

  const claimFounder = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      await api.rewards.claimFounder();
      await fetchStatus();
      await fetchUser();
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  };

  const claimHoliday = async (id: string) => {
    if (claiming) return;
    setClaiming(true);
    try {
      await api.rewards.claimHoliday(id);
      await fetchStatus();
      await fetchUser();
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  };

  return {
    status,
    loading,
    claiming,
    claimDaily,
    claimFounder,
    claimHoliday,
  };
}
