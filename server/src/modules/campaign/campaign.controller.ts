import { Response } from 'express';
import { campaignService } from './campaign.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const getChapters = (req: AuthRequest, res: Response) => {
  try {
    const chapters = campaignService.getChapters(req.userId!);
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const getChapter = (req: AuthRequest, res: Response) => {
  try {
    const chapterId = Number(req.params.id);
    const chapter = campaignService.getChapterById(req.userId!, chapterId);
    res.json(chapter);
  } catch (error: any) {
    if (error.message === 'CHAPTER_NOT_FOUND') return res.status(404).json({ error: 'Глава не найдена' });
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const playPvE = (req: AuthRequest, res: Response) => {
  try {
    const dto = {
      chapterId: Number(req.body.chapterId),
      nodeId: Number(req.body.nodeId),
      playerTime: Number(req.body.playerTime),
      playerShifts: req.body.playerShifts || [],
      usedNos: Boolean(req.body.usedNos),
      distanceMeters: Number(req.body.distanceMeters),
      opponentTime: Number(req.body.opponentTime || 0),
    };

    const result = campaignService.playPvE(req.userId!, dto);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'CHAPTER_NOT_FOUND') return res.status(404).json({ error: 'Глава не найдена' });
    if (error.message === 'NODE_NOT_FOUND') return res.status(404).json({ error: 'Узел не найден' });
    if (error.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Пользователь не найден' });
    if (error.message === 'NOT_ENOUGH_ENERGY') return res.status(400).json({ error: 'Недостаточно энергии' });
    
    console.error('[Campaign Controller] playPvE error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
