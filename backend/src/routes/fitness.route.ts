import { Router } from 'express';
import { analyzeFitness, saveFitnessPlan, debugNetwork } from '../controllers/fitness.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public debug route to test Render internal networking
router.get('/debug', debugNetwork);

// All fitness routes below are protected
router.use(verifyJWT);

router.post('/analyze', analyzeFitness);
router.post('/save-plan', saveFitnessPlan);

export default router;
