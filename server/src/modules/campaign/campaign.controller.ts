import { Response } from 'express';
import { campaignService } from './campaign.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { MESSAGES } from '../../constants/messages';

export const getChapters = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: MESSAGES.errors.unauthorized });
      return;
    }
    const chapters = await campaignService.getChapters(req.user.id);
    res.json(chapters);
  } catch (error) {
    console.error('[Campaign Controller]', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};

export const getChapter = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: MESSAGES.errors.unauthorized });
      return;
    }
    const chapterId = Number(req.params.id);
    const chapter = await campaignService.getChapterById(req.user.id, chapterId);
    res.json(chapter);
  } catch (error) {
    if ((error as Error).message === 'CHAPTER_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.chapterNotFound });
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};

export const playPvE = async (req: AuthRequest, res: Response) => {
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

    const result = await campaignService.playPvE(req.userId!, dto);
    res.json(result);
  } catch (error) {
    if ((error as Error).message === 'CHAPTER_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.chapterNotFound });
    if ((error as Error).message === 'NODE_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.nodeNotFound });
    if ((error as Error).message === 'USER_NOT_FOUND') return res.status(404).json({ error: MESSAGES.errors.userNotFound });
    if ((error as Error).message === 'NOT_ENOUGH_ENERGY') return res.status(400).json({ error: MESSAGES.errors.notEnoughEnergy });
    
    console.error('[Campaign Controller] playPvE error:', error);
    res.status(500).json({ error: MESSAGES.errors.internalServer });
  }
};
