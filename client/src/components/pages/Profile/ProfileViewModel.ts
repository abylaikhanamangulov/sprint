import { useEffect, useState } from 'react';
import { api } from 'src/models/api';
import { useGameStore } from 'src/models/store';
import { RANK_TIERS } from 'src/models/types';
import type { LeaderboardEntry, ProfileData, RankTier, User } from 'src/models/types';
import type { ProfileTab, DailyBonusDay } from './Profile.types';

export interface ProfileViewModel {
  user: User | null;
  profile: ProfileData | null;
  leaderboard: LeaderboardEntry[];
  showLeaderboard: boolean;
  isTasksModalOpen: boolean;
  isStatsModalOpen: boolean;
  isHistoryModalOpen: boolean;
  inProcessAchievements: any[]; // Using AchievementView
  completedAchievements: any[];
  tier: RankTier | undefined;
  winRate: number;
  dailyBonusDays: DailyBonusDay[];
  claimDailyBonus: () => Promise<void>;
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

  const [claiming, setClaiming] = useState(false);

  // Generate the current week (Monday to Sunday)
  const generateDailyBonusDays = (): DailyBonusDay[] => {
    if (!user) return [];
    
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; 
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const lastRewardDate = user.lastDailyReward ? new Date(user.lastDailyReward) : null;
    if (lastRewardDate) lastRewardDate.setHours(0, 0, 0, 0);

    const todayDateOnly = new Date(today);
    todayDateOnly.setHours(0, 0, 0, 0);

    const days: DailyBonusDay[] = [];
    const dayNames = ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      
      const isToday = d.getTime() === todayDateOnly.getTime();
      let status: 'collected' | 'current' | 'missed' = 'missed';

      if (lastRewardDate) {
        const diffDays = Math.round((lastRewardDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < user.dailyStreak) {
          status = 'collected';
        }
      }

      if (isToday && status !== 'collected') {
        status = 'current';
      } else if (d.getTime() > todayDateOnly.getTime()) {
        status = 'missed';
      }

      days.push({
        dayName: dayNames[i],
        dateStr: d.getDate().toString(),
        status,
        isToday,
      });
    }

    return days;
  };

  const dailyBonusDays = generateDailyBonusDays();

  const claimDailyBonus = async () => {
    if (claiming || !user) return;
    const today = dailyBonusDays.find(d => d.isToday);
    if (today?.status === 'collected') return;

    setClaiming(true);
    try {
      const res = await api.auth.claimDaily();
      const newProfile = await api.profile.get();
      setProfile(newProfile);
      
      useGameStore.setState((state) => ({
        user: {
          ...state.user!,
          dailyStreak: res.streak,
          lastDailyReward: new Date().toISOString(),
          coins: state.user!.coins + res.reward.coins,
        }
      }));

    } catch (err) {
      console.error('Failed to claim daily bonus', err);
    } finally {
      setClaiming(false);
    }
  };

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
    dailyBonusDays,
    claimDailyBonus,
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
