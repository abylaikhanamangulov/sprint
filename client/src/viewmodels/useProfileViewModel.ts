import { useEffect, useState } from 'react';
import { api } from '../models/api';
import { useGameStore } from '../models/store';
import { RANK_TIERS } from '../models/types';
import type { LeaderboardEntry, ProfileData, RankTier, User } from '../models/types';

export type ProfileTab = 'stats' | 'achievements' | 'history';

interface ProfileViewModel {
  user: User | null;
  profile: ProfileData | null;
  tab: ProfileTab;
  leaderboard: LeaderboardEntry[];
  showLeaderboard: boolean;
  tier: RankTier | undefined;
  winRate: number;
  setTab: (t: ProfileTab) => void;
  loadLeaderboard: () => Promise<void>;
  hideLeaderboard: () => void;
}

export function useProfileViewModel(): ProfileViewModel {
  const { user } = useGameStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [tab, setTab] = useState<ProfileTab>('stats');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    api.profile.get().then(setProfile);
  }, []);

  const tier = user ? RANK_TIERS.find((t) => t.tier === user.rankTier) : undefined;
  const winRate =
    user && user.stats.pvpWins + user.stats.pvpLosses > 0
      ? Math.round((user.stats.pvpWins / (user.stats.pvpWins + user.stats.pvpLosses)) * 100)
      : 0;

  return {
    user,
    profile,
    tab,
    leaderboard,
    showLeaderboard,
    tier,
    winRate,
    setTab,
    loadLeaderboard: async () => {
      const lb = await api.profile.leaderboard();
      setLeaderboard(lb);
      setShowLeaderboard(true);
    },
    hideLeaderboard: () => setShowLeaderboard(false),
  };
}
