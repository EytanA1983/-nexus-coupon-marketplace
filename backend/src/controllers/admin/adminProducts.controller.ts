import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AdminProductsService } from "../../services/products/adminProducts.service";

const adminProductsService = new AdminProductsService();

export async function getAdminProducts(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await adminProductsService.getAllProducts();
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
}

export async function getAdminProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const product = await adminProductsService.getProductById(req.params.productId);
    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    next(error);
  }
}

export async function createAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const createdProduct = await adminProductsService.createCouponProduct(req.body);
    res.status(StatusCodes.CREATED).json(createdProduct);
  } catch (error) {
    next(error);
  }
}

export async function updateAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const updatedProduct = await adminProductsService.updateCouponProduct(
      req.params.productId,
      req.body
    );
    res.status(StatusCodes.OK).json(updatedProduct);
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await adminProductsService.deleteProduct(req.params.productId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
}
