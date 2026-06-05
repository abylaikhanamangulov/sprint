import { Router } from 'express';
import { dataStore, FILES } from '../data';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/chapters', authMiddleware, (req: AuthRequest, res) => {
  const campaignData = dataStore.get<any>(FILES.CAMPAIGN);
  const userProgress = campaignData.userProgress.filter((p: any) => p.userId === req.userId);

  const chapters = campaignData.chapters.map((chapter: any) => {
    const chapterProgress = userProgress.filter((p: any) => p.chapterId === chapter.id);
    const completedNodes = chapterProgress.filter((p: any) => p.completed).length;
    const totalStars = chapterProgress.reduce((sum: number, p: any) => sum + p.stars, 0);
    const maxStars = chapter.nodes.length * 3;

    let isUnlocked = chapter.id === 1;
    if (chapter.unlockCondition) {
      const [, prevChapter] = chapter.unlockCondition.match(/chapter:(\d+):complete/) || [];
      if (prevChapter) {
        const prevNodes = campaignData.chapters.find((c: any) => c.id === Number(prevChapter))?.nodes || [];
        const prevBoss = prevNodes.find((n: any) => n.type === 'boss');
        if (prevBoss) {
          isUnlocked = userProgress.some(
            (p: any) => p.chapterId === Number(prevChapter) && p.nodeId === prevBoss.id && p.completed
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

  res.json(chapters);
});

router.get('/chapters/:id', authMiddleware, (req: AuthRequest, res) => {
  const chapterId = Number(req.params.id);
  const campaignData = dataStore.get<any>(FILES.CAMPAIGN);
  const chapter = campaignData.chapters.find((c: any) => c.id === chapterId);

  if (!chapter) {
    res.status(404).json({ error: 'Глава не найдена' });
    return;
  }

  const userProgress = campaignData.userProgress.filter(
    (p: any) => p.userId === req.userId && p.chapterId === chapterId
  );

  const nodes = chapter.nodes.map((node: any, index: number) => {
    const progress = userProgress.find((p: any) => p.nodeId === node.id);
    const prevNode = index > 0 ? chapter.nodes[index - 1] : null;
    const prevCompleted = !prevNode || userProgress.some(
      (p: any) => p.nodeId === prevNode.id && p.completed
    );

    return {
      ...node,
      stars: progress?.stars || 0,
      completed: progress?.completed || false,
      isAvailable: index === 0 || prevCompleted,
    };
  });

  res.json({ ...chapter, nodes });
});

export default router;
