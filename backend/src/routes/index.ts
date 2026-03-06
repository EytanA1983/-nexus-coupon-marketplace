import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';
import { authRouter } from './auth.routes';
import { adminCouponsRouter } from './admin.coupons.routes';
import { adminPurchasesRouter } from './admin.purchases.routes';
import customerProductsRoutes from './customerProducts.routes';
import resellerProductsRoutes from './resellerProducts.routes';

const routes = Router();

routes.get('/health', getHealth);

routes.get('/', (_req, res) => {
  res.json({ ok: true, service: 'nexus-coupon-marketplace-backend' });
});

routes.get('/version', (_req, res) => {
  res.json({
    name: 'nexus-coupon-marketplace-backend',
    version: process.env.npm_package_version ?? '0.1.0',
  });
});

// Admin Auth
routes.use('/admin/auth', authRouter);

// Admin Coupons (JWT required)
routes.use('/admin/coupons', adminCouponsRouter);

// Admin Purchases (JWT required)
routes.use('/admin/purchases', adminPurchasesRouter);

// Customer Products (Public) - includes GET routes and purchase
routes.use('/customer/products', customerProductsRoutes);

// Reseller API v1 (Bearer token required) - includes GET routes and purchase
routes.use('/v1/products', resellerProductsRoutes);

export default routes;
