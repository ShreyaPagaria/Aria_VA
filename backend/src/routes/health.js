import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'voice-scheduling-agent-backend' });
});

export default router;
