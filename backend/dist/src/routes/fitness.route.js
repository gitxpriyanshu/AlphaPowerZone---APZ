import { Router } from 'express';
import { analyzeFitness, saveFitnessPlan } from '../controllers/fitness.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = Router();
// All fitness routes are protected
router.use(verifyJWT);
router.post('/analyze', analyzeFitness);
router.post('/save-plan', saveFitnessPlan);
export default router;
