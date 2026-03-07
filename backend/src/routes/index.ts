import { Router } from "express";
import { getHealth } from "../controllers/health.controller";
import adminAuthRoutes from "./adminAuth.routes";
import adminProductsRoutes from "./adminProducts.routes";
import customerProductsRoutes from "./customerProducts.routes";
import resellerProductsRoutes from "./resellerProducts.routes";
import { adminPurchasesRouter } from "./admin.purchases.routes";

const router = Router();

router.get("/health", getHealth);

router.use("/api/admin/auth", adminAuthRoutes);
router.use("/api/admin/products", adminProductsRoutes);
router.use("/api/admin/purchases", adminPurchasesRouter);
router.use("/api/customer/products", customerProductsRoutes);
router.use("/api/v1/products", resellerProductsRoutes);

export default router;
