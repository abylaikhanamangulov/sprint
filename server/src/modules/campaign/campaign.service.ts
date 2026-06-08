import { campaignChaptersCol, campaignProgressCol, usersCol, racesCol } from '../../core/database';
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

  async getChapters(userId: number) {
    const chapters = await campaignChaptersCol.find().toArray();
    const userProgress = await campaignProgressCol.find({ userId }).toArray();

    return chapters.map(chapter => {
      const chapterProgress = userProgress.filter(p => p.chapterId === chapter.id);
      const completedNodes = chapterProgress.filter(p => p.completed).length;
      const totalStars = chapterProgress.reduce((sum, p) => sum + p.stars, 0);
      const maxStars = chapter.nodes.length * 3;

      let isUnlocked = chapter.id === 1;
      if (chapter.unlockCondition) {
        const [, prevChapter] = chapter.unlockCondition.match(/chapter:(\d+):complete/) || [];
        if (prevChapter) {
          const prevNodes = chapters.find(c => c.id === Number(prevChapter))?.nodes || [];
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

  async getChapterById(userId: number, chapterId: number) {
    const chapter = await campaignChaptersCol.findOne({ id: chapterId });

    if (!chapter) throw new Error('CHAPTER_NOT_FOUND');

    const userProgress = await campaignProgressCol.find({ userId, chapterId }).toArray();

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

  async playPvE(userId: number, dto: PlayPvEDto) {
    const chapter = await campaignChaptersCol.findOne({ id: dto.chapterId });
    if (!chapter) throw new Error('CHAPTER_NOT_FOUND');

    const node = chapter.nodes.find(n => n.id === dto.nodeId);
    if (!node) throw new Error('NODE_NOT_FOUND');

    const user = await usersCol.findOne({ id: userId });
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
      rewards: playerWon ? { winner: { coins: node.rewards.coins, xp: node.rewards.xp } } : {},
      createdAt: new Date().toISOString(),
    };

    await racesCol.insertOne(raceResult);

    const bestTime = (playerWon && (user.stats.bestTime === 0 || dto.playerTime < user.stats.bestTime)) 
            ? dto.playerTime 
            : user.stats.bestTime;

    await usersCol.updateOne({ id: userId }, {
      $inc: {
        energy: -node.energyCost,
        coins: playerWon ? node.rewards.coins : 0,
        xp: playerWon ? node.rewards.xp : 0,
        'stats.totalRaces': 1
      },
      $set: {
        'stats.bestTime': bestTime
      }
    });

    if (playerWon) {
      const existing = await campaignProgressCol.findOne({ userId, chapterId: dto.chapterId, nodeId: dto.nodeId });
      if (existing) {
        await campaignProgressCol.updateOne(
          { userId, chapterId: dto.chapterId, nodeId: dto.nodeId },
          { $set: { stars: Math.max(existing.stars, stars), completed: true } }
        );
      } else {
        await campaignProgressCol.insertOne({ userId, chapterId: dto.chapterId, nodeId: dto.nodeId, stars, completed: true });
      }
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
