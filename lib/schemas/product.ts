import { z } from "zod";

export const ProductSchema = z.object({
	id: z.uuid(),
	name: z.string().min(2),
	description: z.string().min(2),
	price: z.float64().min(0),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type ProductRow = z.infer<typeof ProductSchema>;

export const ProductCreateSchema = z.object({
	name: z.string().min(2),
	description: z.string().min(2),
	price: z.float64().min(0),
});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;

export const ProductUpdateSchema = z.object({
	name: z.string().min(2).optional(),
	description: z.string().min(2).optional(),
	price: z.float64().min(0).optional(),
});

export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
