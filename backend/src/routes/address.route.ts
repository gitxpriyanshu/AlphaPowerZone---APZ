import { Router } from 'express';
import * as addressController from '../controllers/address.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createAddressSchema } from '../validators/address.validator.js';
import { authRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authRateLimiter);

router.get('/', addressController.listAddresses);
router.post('/', validate(createAddressSchema), addressController.createAddress);
router.put('/:id', validate(createAddressSchema), addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

export default router;
