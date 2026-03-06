import { NextFunction, Request, Response } from 'express';
import { AdminCouponService } from '../../services/adminCoupon.service';
import { CreateCouponProductRequestDto, UpdateCouponProductRequestDto } from '../../dto/products.dto';

const service = new AdminCouponService();

export async function listCoupons(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCouponById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params.id || req.params.productId) as string;
    const data = await service.getById(id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    // Body is already validated by validateRequest middleware
    const body = req.body as CreateCouponProductRequestDto;
    const data = await service.create(body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params.id || req.params.productId) as string;
    // Body is already validated by validateRequest middleware
    const body = req.body as UpdateCouponProductRequestDto;
    const data = await service.update(id, body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = await service.delete(id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getCouponStats(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = await service.getStats(id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
