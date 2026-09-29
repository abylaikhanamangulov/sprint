import { useEffect, useState } from 'react';
import { api } from 'src/models/api';
import { useGameStore } from 'src/models/store';
import { RANK_TIERS } from 'src/models/types';
import type { LeaderboardEntry, ProfileData, RankTier, User, AchievementView } from 'src/models/types';
import type { ProfileTab, DailyBonusDay } from './Profile.types';

export interface ProfileViewModel {
  user: User | null;
  profile: ProfileData | null;
  leaderboard: LeaderboardEntry[];
  showLeaderboard: boolean;
  isTasksModalOpen: boolean;
  isStatsModalOpen: boolean;
  isHistoryModalOpen: boolean;
  inProcessAchievements: AchievementView[];
  completedAchievements: AchievementView[];
  tier: RankTier | undefined;
  winRate: number;
  setTasksModalOpen: (open: boolean) => void;
  setStatsModalOpen: (open: boolean) => void;
  setHistoryModalOpen: (open: boolean) => void;
  loadLeaderboard: () => Promise<void>;
  hideLeaderboard: () => void;
}

export function useProfileViewModel(): ProfileViewModel {
  const { user } = useGameStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isTasksModalOpen, setTasksModalOpen] = useState(false);
  const [isStatsModalOpen, setStatsModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    api.profile.get().then(setProfile);
  }, []);

  const tier = user ? RANK_TIERS.find((t) => t.tier === user.rankTier) : undefined;
  const winRate =
    user && user.stats.pvpWins + user.stats.pvpLosses > 0
      ? Math.round((user.stats.pvpWins / (user.stats.pvpWins + user.stats.pvpLosses)) * 100)
      : 0;

  const inProcessAchievements = profile ? profile.achievements.filter(a => !a.unlocked) : [];
  const completedAchievements = profile ? profile.achievements.filter(a => a.unlocked) : [];



  return {
    user,
    profile,
    leaderboard,
    showLeaderboard,
    isTasksModalOpen,
    isStatsModalOpen,
    isHistoryModalOpen,
    inProcessAchievements,
    completedAchievements,
    tier,
    winRate,
    setTasksModalOpen,
    setStatsModalOpen,
    setHistoryModalOpen,
    loadLeaderboard: async () => {
      const lb = await api.profile.leaderboard();
      setLeaderboard(lb);
      setShowLeaderboard(true);
    },
    hideLeaderboard: () => setShowLeaderboard(false),
  };
}
