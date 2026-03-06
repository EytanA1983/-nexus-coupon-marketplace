import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

type Schemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  headers?: ZodTypeAny;
};

/**
 * Reusable Zod-based request validation middleware.
 *
 * - Validates selected request parts (body/params/query/headers).
 * - Overwrites the corresponding req fields with parsed (transformed) values.
 * - On validation errors, throws ZodError which is mapped by the centralized error handler.
 */
export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.headers) {
        // Express lowercases header keys; schemas should expect lowercase keys.
        req.headers = schemas.headers.parse(req.headers);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

