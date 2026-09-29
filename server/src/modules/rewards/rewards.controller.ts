import { Request, Response } from 'express';
import { usersCol } from '../../core/database';
import { DAILY_REWARDS, FOUNDER_CUTOFF_DATE, FOUNDER_REWARD, HOLIDAYS, RewardData } from './rewards.config';

class RewardsController {
  
  // Получить статус всех наград
  async getStatus(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await usersCol.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const today = now.getDate();

    // Если месяц сменился, виртуально сбрасываем состояние для ответа
    const isNewMonth = user.rewardMonth !== currentMonth;
    const claimedDays = isNewMonth ? [] : (user.claimedDays || []);

    const isFounder = new Date(user.createdAt) < FOUNDER_CUTOFF_DATE;
    const canClaimFounder = isFounder && !user.founderRewardClaimed;

    const activeHolidays = HOLIDAYS.filter(h => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate);
      return now >= start && now <= end;
    }).map(h => ({
      id: h.id,
      name: h.name,
      reward: h.reward,
      claimed: (user.claimedHolidays || []).includes(h.id)
    }));

    return res.json({
      currentMonth,
      today,
      claimedDays,
      dailyRewardAvailable: !claimedDays.includes(today),
      canClaimFounder,
      activeHolidays
    });
  }

  // Забрать ежедневную награду
  async claimDaily(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await usersCol.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const today = now.getDate();

    let claimedDays = user.claimedDays || [];
    if (user.rewardMonth !== currentMonth) {
      claimedDays = [];
    }

    if (claimedDays.includes(today)) {
      return res.status(400).json({ error: 'Daily reward already claimed today' });
    }

    // Защита от выхода за пределы массива
    const rewardIndex = Math.min(today - 1, DAILY_REWARDS.length - 1);
    const reward = DAILY_REWARDS[rewardIndex];

    claimedDays.push(today);

    const updateQuery = this.buildRewardQuery(reward);
    
    await usersCol.updateOne({ id: userId }, {
      $set: {
        rewardMonth: currentMonth,
        claimedDays: claimedDays,
        ...updateQuery.$set
      },
      $inc: updateQuery.$inc
    });

    return res.json({ success: true, reward, today });
  }

  // Забрать награду основателя
  async claimFounder(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await usersCol.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isFounder = new Date(user.createdAt) < FOUNDER_CUTOFF_DATE;
    if (!isFounder) {
      return res.status(400).json({ error: 'You are not a founder' });
    }
    if (user.founderRewardClaimed) {
      return res.status(400).json({ error: 'Founder reward already claimed' });
    }

    const reward = FOUNDER_REWARD;
    const updateQuery = this.buildRewardQuery(reward);

    await usersCol.updateOne({ id: userId }, {
      $set: {
        founderRewardClaimed: true,
        ...updateQuery.$set
      },
      $inc: updateQuery.$inc
    });

    return res.json({ success: true, reward });
  }

  // Забрать праздничную награду
  async claimHoliday(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const holidayId = req.body.holidayId;

    const user = await usersCol.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const holiday = HOLIDAYS.find(h => h.id === holidayId);
    
    if (!holiday) return res.status(404).json({ error: 'Holiday not found' });
    if (now < new Date(holiday.startDate) || now > new Date(holiday.endDate)) {
      return res.status(400).json({ error: 'Holiday event is not active' });
    }

    const claimedHolidays = user.claimedHolidays || [];
    if (claimedHolidays.includes(holidayId)) {
      return res.status(400).json({ error: 'Holiday reward already claimed' });
    }

    claimedHolidays.push(holidayId);
    const reward = holiday.reward;
    const updateQuery = this.buildRewardQuery(reward);

    await usersCol.updateOne({ id: userId }, {
      $set: {
        claimedHolidays: claimedHolidays,
        ...updateQuery.$set
      },
      $inc: updateQuery.$inc
    });

    return res.json({ success: true, reward });
  }

  // Утилита для построения Mongo Update Query
  private buildRewardQuery(reward: RewardData) {
    const $inc: any = {};
    if (reward.coins) $inc.coins = reward.coins;
    if (reward.xp) $inc.xp = reward.xp;
    if (reward.points) $inc.points = reward.points;
    return { $inc, $set: {} };
  }
}

export const rewardsController = new RewardsController();
