import { z } from "zod";

export const createCouponProductSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().min(1, "Description is required."),
  image_url: z.string().url("image_url must be a valid URL."),
  cost_price: z.number().min(0, "cost_price must be >= 0."),
  margin_percentage: z.number().min(0, "margin_percentage must be >= 0."),
  value_type: z.enum(["STRING", "IMAGE"]),
  value: z.string().min(1, "Value is required."),
});

export const updateCouponProductSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    image_url: z.string().url().optional(),
    cost_price: z.number().min(0).optional(),
    margin_percentage: z.number().min(0).optional(),
    value_type: z.enum(["STRING", "IMAGE"]).optional(),
    value: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  });
