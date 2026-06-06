import { Router } from 'express';
import * as garageController from './garage.controller';
import { authMiddleware } from '../../core/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/my-cars', garageController.getMyCars);
router.post('/select/:carId', garageController.selectCar);

router.get('/upgrades/:carId', garageController.getUpgrades);
router.post('/upgrade', garageController.buyUpgrade);

router.get('/tuning/:carId', garageController.getTuning);
router.post('/tuning/:carId', garageController.saveTuning);

router.get('/cosmetics/:carId', garageController.getCosmetics);
router.post('/cosmetics/:carId', garageController.saveCosmetics);

export default router;
