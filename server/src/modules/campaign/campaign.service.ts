import { dataStore, FILES } from '../../core/database';
import { ShiftQuality, RaceResult, CampaignChapter, CampaignNode, CampaignProgress } from '@drag-racing/shared/types';

export interface PlayPvEDto {
  chapterId: number;
  nodeId: number;
  playerTime: number;
  playerShifts: ShiftQuality[];
  usedNos: boolean;
  distanceMeters: number;
  opponentTime: number;
}

export class CampaignService {
  private simulateAiRace(aiPP: number, difficulty: number): { time: number; shifts: ShiftQuality[] } {
    const baseTime = 15 - (aiPP / 100);
    const variance = (Math.random() - 0.5) * 0.5;
    const time = Math.max(8, baseTime + variance);

    const gears = 5 + (aiPP > 300 ? 1 : 0);
    const shifts: ShiftQuality[] = [];
    for (let i = 0; i < gears; i++) {
      const roll = Math.random();
      if (roll < difficulty * 0.5) shifts.push('perfect');
      else if (roll < difficulty * 0.8) shifts.push('good');
      else shifts.push('miss');
    }

    return { time: Math.round(time * 1000) / 1000, shifts };
  }

  getChapters(userId: number) {
    const campaignData = dataStore.get(FILES.CAMPAIGN);
    const userProgress = campaignData.userProgress.filter(p => p.userId === userId);

    return campaignData.chapters.map(chapter => {
      const chapterProgress = userProgress.filter(p => p.chapterId === chapter.id);
      const completedNodes = chapterProgress.filter(p => p.completed).length;
      const totalStars = chapterProgress.reduce((sum, p) => sum + p.stars, 0);
      const maxStars = chapter.nodes.length * 3;

      let isUnlocked = chapter.id === 1;
      if (chapter.unlockCondition) {
        const [, prevChapter] = chapter.unlockCondition.match(/chapter:(\d+):complete/) || [];
        if (prevChapter) {
          const prevNodes = campaignData.chapters.find(c => c.id === Number(prevChapter))?.nodes || [];
          const prevBoss = prevNodes.find(n => n.type === 'boss');
          if (prevBoss) {
            isUnlocked = userProgress.some(
              p => p.chapterId === Number(prevChapter) && p.nodeId === prevBoss.id && p.completed
            );
          }
        }
      }

      return {
        ...chapter,
        isUnlocked,
        completedNodes,
        totalNodes: chapter.nodes.length,
        totalStars,
        maxStars,
      };
    });
  }

  getChapterById(userId: number, chapterId: number) {
    const campaignData = dataStore.get(FILES.CAMPAIGN);
    const chapter = campaignData.chapters.find(c => c.id === chapterId);

    if (!chapter) throw new Error('CHAPTER_NOT_FOUND');

    const userProgress = campaignData.userProgress.filter(
      p => p.userId === userId && p.chapterId === chapterId
    );

    const nodes = chapter.nodes.map((node, index) => {
      const progress = userProgress.find(p => p.nodeId === node.id);
      const prevNode = index > 0 ? chapter.nodes[index - 1] : null;
      const prevCompleted = !prevNode || userProgress.some(
        p => p.nodeId === prevNode.id && p.completed
      );

      return {
        ...node,
        stars: progress?.stars || 0,
        completed: progress?.completed || false,
        isAvailable: index === 0 || prevCompleted,
      };
    });

    return { ...chapter, nodes };
  }

  playPvE(userId: number, dto: PlayPvEDto) {
    const campaignData = dataStore.get(FILES.CAMPAIGN);
    const chapter = campaignData.chapters.find(c => c.id === dto.chapterId);
    if (!chapter) throw new Error('CHAPTER_NOT_FOUND');

    const node = chapter.nodes.find(n => n.id === dto.nodeId);
    if (!node) throw new Error('NODE_NOT_FOUND');

    const users = dataStore.get(FILES.USERS);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.energy < node.energyCost) throw new Error('NOT_ENOUGH_ENERGY');

    const distFactor = (dto.distanceMeters || 402) / 402;
    const difficulty = node.type === 'boss' ? 0.85 : 0.6;
    const aiResult = this.simulateAiRace(node.opponentCar.pp, difficulty);

    if (dto.opponentTime > 0) {
      aiResult.time = Math.round(dto.opponentTime * 1000) / 1000;
    } else {
      aiResult.time = Math.round(aiResult.time * distFactor * 1000) / 1000;
    }

    const playerWon = dto.playerTime < aiResult.time;
    let stars = 0;

    if (playerWon) {
      for (const threshold of node.starThresholds) {
        if (dto.playerTime <= threshold * distFactor) stars++;
      }
      stars = Math.max(1, stars);
    }

    const raceResult: RaceResult = {
      id: Date.now(),
      type: 'campaign',
      player1: { userId: userId, carId: user.selectedCarId || 0, time: dto.playerTime, shifts: dto.playerShifts },
      player2: { userId: null, carId: null, time: aiResult.time, shifts: aiResult.shifts },
      winnerId: playerWon ? userId : 0,
      distance: 'quarter', 
      rewards: playerWon ? { winner: { silver: node.rewards.silver, xp: node.rewards.xp } } : {},
      createdAt: new Date().toISOString(),
    };

    dataStore.update(FILES.RACES, races => [...races, raceResult]);

    dataStore.update(FILES.USERS, currentUsers =>
      currentUsers.map(u => u.id === userId ? {
        ...u,
        energy: u.energy - node.energyCost,
        silver: playerWon ? u.silver + node.rewards.silver : u.silver,
        xp: playerWon ? u.xp + node.rewards.xp : u.xp,
        stats: {
          ...u.stats,
          totalRaces: u.stats.totalRaces + 1,
          bestTime: (playerWon && (u.stats.bestTime === 0 || dto.playerTime < u.stats.bestTime)) 
            ? dto.playerTime 
            : u.stats.bestTime,
        },
      } : u)
    );

    if (playerWon) {
      dataStore.update(FILES.CAMPAIGN, data => {
        const existing = data.userProgress.find(
          p => p.userId === userId && p.chapterId === dto.chapterId && p.nodeId === dto.nodeId
        );
        if (existing) {
          existing.stars = Math.max(existing.stars, stars);
          existing.completed = true;
        } else {
          data.userProgress.push({ userId, chapterId: dto.chapterId, nodeId: dto.nodeId, stars, completed: true });
        }
        return data;
      });
    }

    return {
      result: raceResult,
      playerWon,
      stars,
      aiTime: aiResult.time,
      rewards: playerWon ? node.rewards : null,
    };
  }
}

export const campaignService = new CampaignService();
