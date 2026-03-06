import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { validateRequest } from '../middleware/validateRequest';
import {
  listCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
} from '../controllers/admin/adminProducts.controller';
import {
  createAdminCouponSchema,
  idParamSchema,
  updateAdminCouponSchema,
} from '../validators/adminCoupon.validator';

export const adminCouponsRouter = Router();

adminCouponsRouter.use(authenticateAdmin);

adminCouponsRouter.get('/', listCoupons);
adminCouponsRouter.post('/', validateRequest({ body: createAdminCouponSchema }), createCoupon);
adminCouponsRouter.get('/:id', validateRequest({ params: idParamSchema }), getCouponById);
adminCouponsRouter.get('/:id/stats', validateRequest({ params: idParamSchema }), getCouponStats);
adminCouponsRouter.put(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateAdminCouponSchema }),
  updateCoupon
);
adminCouponsRouter.delete('/:id', validateRequest({ params: idParamSchema }), deleteCoupon);

// Also support :productId for consistency with other routes
adminCouponsRouter.get('/:productId', validateRequest({ params: idParamSchema }), getCouponById);
adminCouponsRouter.get('/:productId/stats', validateRequest({ params: idParamSchema }), getCouponStats);
adminCouponsRouter.put(
  '/:productId',
  validateRequest({ params: idParamSchema, body: updateAdminCouponSchema }),
  updateCoupon
);
adminCouponsRouter.delete('/:productId', validateRequest({ params: idParamSchema }), deleteCoupon);
