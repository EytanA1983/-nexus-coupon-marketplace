import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PurchaseService } from '../../services/purchases/purchase.service';

const purchaseService = new PurchaseService();

export async function purchaseResellerProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await purchaseService.purchaseReseller({
      productId: req.params.productId,
      resellerPrice: req.body.reseller_price,
    });

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
}
