import { Router } from "express";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductById,
  getAdminProducts,
  updateAdminProduct,
} from "../controllers/admin/adminProducts.controller";
import { authenticateAdmin } from "../middleware/authenticateAdmin";
import { validateRequest } from "../middleware/validateRequest";
import { productIdParamSchema } from "../validators/params.validator";
import {
  createCouponProductSchema,
  updateCouponProductSchema,
} from "../validators/product.validator";

const router = Router();

router.use(authenticateAdmin);

router.get("/", getAdminProducts);
router.get(
  "/:productId",
  validateRequest({ params: productIdParamSchema }),
  getAdminProductById
);
router.post("/", validateRequest({ body: createCouponProductSchema }), createAdminProduct);
router.put(
  "/:productId",
  validateRequest({
    params: productIdParamSchema,
    body: updateCouponProductSchema,
  }),
  updateAdminProduct
);
router.delete(
  "/:productId",
  validateRequest({ params: productIdParamSchema }),
  deleteAdminProduct
);

export default router;
