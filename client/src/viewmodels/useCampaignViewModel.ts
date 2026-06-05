import { useEffect, useState } from 'react';
import { api } from '../models/api';
import { useGameStore } from '../models/store';
import type { CampaignChapterDetail, CampaignChapterListItem } from '../models/types';

interface CampaignViewModel {
  chapters: CampaignChapterListItem[];
  selectedChapter: CampaignChapterDetail | null;
  loading: boolean;
  energy: number;
  maxEnergy: number;
  openChapter: (id: number) => Promise<void>;
  closeChapter: () => void;
  goRace: () => void;
}

export function useCampaignViewModel(): CampaignViewModel {
  const { user, setScreen } = useGameStore();
  const [chapters, setChapters] = useState<CampaignChapterListItem[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<CampaignChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.campaign.chapters().then((data) => {
      setChapters(data);
      setLoading(false);
    });
  }, []);

  return {
    chapters,
    selectedChapter,
    loading,
    energy: user?.energy ?? 0,
    maxEnergy: user?.maxEnergy ?? 0,
    openChapter: async (id) => {
      const data = await api.campaign.chapter(id);
      setSelectedChapter(data);
    },
    closeChapter: () => setSelectedChapter(null),
    goRace: () => setScreen('race'),
  };
}
