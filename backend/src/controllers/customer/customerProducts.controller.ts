import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PurchaseService } from '../../services/purchases/purchase.service';

const purchaseService = new PurchaseService();

export async function purchaseCustomerProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await purchaseService.purchaseDirectCustomer({
      productId: req.params.productId,
    });

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
}
