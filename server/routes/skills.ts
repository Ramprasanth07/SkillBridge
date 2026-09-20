import { Router, Request, Response } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/skills/catalog
router.get('/catalog', (_req: Request, res: Response) => {
  try {
    const allSkills = db.getAllSkills();
    const technical = allSkills.filter(s => s.category === 'technical');
    const soft = allSkills.filter(s => s.category === 'soft');

    return res.json({
      all: allSkills,
      technical,
      soft
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch skills catalog' });
  }
});

export default router;
